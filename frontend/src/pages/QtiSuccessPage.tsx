import { useState, useEffect } from 'react';
import { ROUTES } from '../navigation/routes';
import type { ProcessQuizResponse } from '../types/qti';
import { Navbar } from '../components/Navbar';

interface QtiSuccessPageProps {
  onNavigate: (route: string) => void;
}

export function QtiSuccessPage({ onNavigate }: QtiSuccessPageProps) {
  const [result, setResult] = useState<ProcessQuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load result data from sessionStorage
    const storedData = sessionStorage.getItem('qtiProcessResult');
    if (!storedData) {
      setError('No import result found.');
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setResult(parsed);
    } catch (err) {
      setError('Failed to load import result');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen theme-surface">
        <Navbar onBack={() => onNavigate(ROUTES.HOME)} />
        <div className="max-w-[800px] mx-auto mt-10 p-5 text-center theme-card">
          <h1 className="text-2xl font-bold theme-text mb-5">Error</h1>
          <p className="mb-5 theme-text-secondary">{error}</p>
          <button className="h-12 px-6 font-bold border-2 theme-border-strong theme-text" onClick={() => onNavigate(ROUTES.QUIZ_IMPORT)}>
            &larr; Back to Import
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="text-center p-10 text-xl font-sans theme-surface theme-text">Loading results...</div>;
  }

  return (
    <div className="min-h-screen theme-surface">
      <Navbar onBack={() => onNavigate(ROUTES.HOME)} />

      <div className="max-w-[700px] mx-auto p-[60px_20px] text-center">
        <div className="text-[5rem] mb-[30px] md:text-[3.5rem]">✅</div>

        <div className="border-2 theme-border-strong theme-surface shadow-xl">
          <div className="p-10 md:p-[30px_20px]">
            <h2 className="text-[2rem] font-bold mb-[15px] theme-text md:text-[1.6rem]">QTI Generation Successful!</h2>

            <p className="theme-text-secondary mb-[30px] text-[1.1rem] leading-relaxed">
              Your quiz has been converted to QTI 1.2 format and the import process has been
              initiated.
            </p>

            {result.success && (
              <div className="p-[15px] border border-green-500 mb-[30px] text-left border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-medium">
                <strong className="font-bold">✓ Success!</strong> {result.message}
              </div>
            )}

            {result.quiz && (
              <div className="mb-[30px] text-left">
                <h5 className="text-[1.2rem] font-bold mb-[15px] theme-text text-center">Quiz Details:</h5>
                <table className="w-full border-collapse border theme-border-strong">
                  <tbody>
                    <tr>
                      <th className="p-2.5 border theme-border text-left w-[40%] font-bold theme-elevated theme-text">Title:</th>
                      <td className="p-2.5 border theme-border text-left theme-surface theme-text">{result.quiz.title}</td>
                    </tr>
                    <tr>
                      <th className="p-2.5 border theme-border text-left w-[40%] font-bold theme-elevated theme-text">Questions:</th>
                      <td className="p-2.5 border theme-border text-left theme-surface theme-text">{result.quiz.questions.length} questions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {result.importResult && (
              <div className="mb-[30px] text-left">
                <h5 className="text-[1.2rem] font-bold mb-[15px] theme-text text-center">Import Status:</h5>
                <table className="w-full border-collapse border theme-border-strong">
                  <tbody>
                    <tr>
                      <th className="p-2.5 border theme-border text-left w-[40%] font-bold theme-elevated theme-text">Status:</th>
                      <td className="p-2.5 border theme-border text-left theme-surface">
                        {result.importResult.success ? (
                          <span className="bg-[var(--color-accent)] text-white px-2.5 py-[3px] rounded-[3px] font-semibold text-[0.85rem]">✓ Success</span>
                        ) : (
                          <span className="theme-surface theme-text border-2 theme-border-strong px-2.5 py-[3px] rounded-[3px] font-semibold text-[0.85rem]">✗ Failed</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2.5 border theme-border text-left w-[40%] font-bold theme-elevated theme-text">Message:</th>
                      <td className="p-2.5 border theme-border text-left theme-surface theme-text">{result.importResult.message}</td>
                    </tr>
                    {result.importResult.error && (
                      <tr>
                        <th className="p-2.5 border theme-border text-left w-[40%] font-bold theme-elevated theme-text">Error:</th>
                        <td className="p-2.5 border theme-border text-left theme-surface text-red-600 dark:text-red-400 font-semibold">{result.importResult.error}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <p className="theme-text-muted text-[0.9rem] mb-[30px] italic">
              Check Canvas for the imported question bank. It may take a few moments to process.
            </p>

            <div className="flex gap-4 justify-center md:flex-col">
              <button onClick={() => onNavigate(ROUTES.HOME)} className="h-12 px-6 font-bold bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent)] md:w-full">
                🏠 Home
              </button>
              <button onClick={() => onNavigate(ROUTES.QUIZ_IMPORT)} className="h-12 px-6 font-bold border-2 theme-border-strong theme-text md:w-full">
                📝 Import Another Quiz
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 theme-text-secondary text-[0.9rem]">
          <small>QTI Helper v2.0 | Import Complete</small>
        </div>
      </div>
    </div>
  );
}

