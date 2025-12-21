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
      <div className="min-h-screen bg-white">
        <Navbar onBack={() => onNavigate(ROUTES.HOME)} />
        <div className="max-w-[800px] mx-auto mt-10 p-5 text-center bg-white border border-black shadow-lg">
          <h1 className="text-2xl font-bold text-black mb-5">Error</h1>
          <p className="mb-5">{error}</p>
          <button className="h-12 px-6 font-bold border-2 border-black" onClick={() => onNavigate(ROUTES.QUIZ_IMPORT)}>
            &larr; Back to Import
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="text-center p-10 text-xl font-sans bg-white">Loading results...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onBack={() => onNavigate(ROUTES.HOME)} />

      <div className="max-w-[700px] mx-auto p-[60px_20px] text-center">
        <div className="text-[5rem] mb-[30px] md:text-[3.5rem]">✅</div>

        <div className="border-2 border-black bg-white shadow-xl">
          <div className="p-10 md:p-[30px_20px]">
            <h2 className="text-[2rem] font-bold mb-[15px] text-black md:text-[1.6rem]">QTI Generation Successful!</h2>

            <p className="text-[#666] mb-[30px] text-[1.1rem] leading-relaxed">
              Your quiz has been converted to QTI 1.2 format and the import process has been
              initiated.
            </p>

            {result.success && (
              <div className="p-[15px] border border-black mb-[30px] text-left border-2 bg-gray-100 text-green-800 font-medium">
                <strong className="font-bold">✓ Success!</strong> {result.message}
              </div>
            )}

            {result.quiz && (
              <div className="mb-[30px] text-left">
                <h5 className="text-[1.2rem] font-bold mb-[15px] text-black text-center">Quiz Details:</h5>
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <th className="p-2.5 border border-gray-300 text-left w-[40%] font-bold bg-gray-50 text-gray-800">Title:</th>
                      <td className="p-2.5 border border-gray-300 text-left bg-white">{result.quiz.title}</td>
                    </tr>
                    <tr>
                      <th className="p-2.5 border border-gray-300 text-left w-[40%] font-bold bg-gray-50 text-gray-800">Questions:</th>
                      <td className="p-2.5 border border-gray-300 text-left bg-white">{result.quiz.questions.length} questions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {result.importResult && (
              <div className="mb-[30px] text-left">
                <h5 className="text-[1.2rem] font-bold mb-[15px] text-black text-center">Import Status:</h5>
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <th className="p-2.5 border border-gray-300 text-left w-[40%] font-bold bg-gray-50 text-gray-800">Status:</th>
                      <td className="p-2.5 border border-gray-300 text-left bg-white">
                        {result.importResult.success ? (
                          <span className="bg-black text-white px-2.5 py-[3px] rounded-[3px] font-semibold text-[0.85rem]">✓ Success</span>
                        ) : (
                          <span className="bg-white text-black border-2 border-black px-2.5 py-[3px] rounded-[3px] font-semibold text-[0.85rem]">✗ Failed</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2.5 border border-gray-300 text-left w-[40%] font-bold bg-gray-50 text-gray-800">Message:</th>
                      <td className="p-2.5 border border-gray-300 text-left bg-white">{result.importResult.message}</td>
                    </tr>
                    {result.importResult.error && (
                      <tr>
                        <th className="p-2.5 border border-gray-300 text-left w-[40%] font-bold bg-gray-50 text-gray-800">Error:</th>
                        <td className="p-2.5 border border-gray-300 text-left bg-white text-red-600 font-semibold">{result.importResult.error}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[#666] text-[0.9rem] mb-[30px] italic">
              Check Canvas for the imported question bank. It may take a few moments to process.
            </p>

            <div className="flex gap-4 justify-center md:flex-col">
              <button onClick={() => onNavigate(ROUTES.HOME)} className="h-12 px-6 font-bold bg-black text-white border-2 border-black md:w-full">
                🏠 Home
              </button>
              <button onClick={() => onNavigate(ROUTES.QUIZ_IMPORT)} className="h-12 px-6 font-bold border-2 border-black md:w-full">
                📝 Import Another Quiz
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 text-gray-600 text-[0.9rem]">
          <small>QTI Helper v2.0 | Import Complete</small>
        </div>
      </div>
    </div>
  );
}
