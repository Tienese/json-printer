import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { JsonUploadForm } from '../components/qti-converter';
import { qtiService } from '../services';

export function QtiImportPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (file?: File, text?: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await qtiService.parseQuiz(file, text);
      // Navigate to editor with parsed quiz
      navigate('/quiz/editor', { state: { quiz: response.quiz } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse quiz JSON');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <JsonUploadForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </Layout>
  );
}
