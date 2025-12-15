import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { PrintReportUploadForm } from '../components/print-report';
import { printReportService } from '../services';

export function PrintReportPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (
    courseId: string,
    quizId: string,
    csvFile: File,
    reportType: string
  ) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const report = await printReportService.generateReport(courseId, quizId, csvFile, reportType);
      navigate('/print-report/view', { state: { report } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PrintReportUploadForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </Layout>
  );
}
