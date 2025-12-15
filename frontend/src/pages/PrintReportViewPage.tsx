import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { QuizPrintViewModel } from '../types';
import { Layout, ReportDisplay } from '../components';

export function PrintReportViewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report as QuizPrintViewModel | undefined;

  useEffect(() => {
    if (!report) {
      navigate('/print-report');
    }
  }, [report, navigate]);

  if (!report) {
    return null;
  }

  return (
    <Layout>
      <ReportDisplay report={report} />
    </Layout>
  );
}
