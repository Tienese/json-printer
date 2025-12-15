import { useState } from 'react';
import type { WorksheetConfig, WorksheetViewModel } from '../types';
import { Layout, WorksheetBuilder, WorksheetPreview } from '../components';
import { worksheetService } from '../services';

export function WorksheetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [worksheet, setWorksheet] = useState<WorksheetViewModel>();

  const handleGenerate = async (config: WorksheetConfig) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await worksheetService.generateWorksheet(config);
      setWorksheet(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate worksheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setWorksheet(undefined);
  };

  return (
    <Layout>
      {worksheet ? (
        <WorksheetPreview worksheet={worksheet} onBack={handleBack} />
      ) : (
        <WorksheetBuilder
          onGenerate={handleGenerate}
          isLoading={isLoading}
          error={error}
        />
      )}
    </Layout>
  );
}
