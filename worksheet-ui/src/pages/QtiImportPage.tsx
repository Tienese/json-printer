import { useState, useRef } from 'react';
import { ROUTES } from '../navigation/routes';
import { parseQuiz } from '../api/qtiConverter';
import { Navbar } from '../components/Navbar';

interface QtiImportPageProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function QtiImportPage({ onNavigate }: QtiImportPageProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let jsonFile: File | undefined;
      let jsonText: string | undefined;

      if (activeTab === 'upload') {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          setError('Please select a JSON file');
          setLoading(false);
          return;
        }
        jsonFile = file;
      } else {
        const text = textAreaRef.current?.value;
        if (!text || text.trim() === '') {
          setError('Please paste JSON content');
          setLoading(false);
          return;
        }
        jsonText = text;
      }

      const response = await parseQuiz(jsonFile, jsonText);

      // Store quiz data in sessionStorage for editor page
      sessionStorage.setItem('qtiQuizData', JSON.stringify(response.quiz));

      // Navigate to editor page
      onNavigate(ROUTES.QUIZ_EDITOR);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse quiz JSON');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onBack={() => onNavigate(ROUTES.HOME)} />

      <div className="max-w-[900px] mx-auto p-10 md:p-5">
        <div className="text-center mb-10 pb-5 border-b-2 border-black">
          <h1 className="text-[2.5rem] font-bold text-black mb-[10px] flex items-center justify-center gap-[15px] md:text-[1.8rem]">
            <span className="text-[2.5rem]">↻</span> QTI 1.2 Converter
          </h1>
          <p className="text-[1.2rem] text-gray-800">Convert Custom JSON Quiz to Canvas Question Bank</p>
        </div>



        {error && (
          <div className="alert alert-error mb-5" role="alert">
            <strong className="font-bold">Error:</strong> {error}
          </div>
        )}

        <div className="border border-black mb-[30px]">
          <div className="p-[15px_20px] border-b border-black bg-white">
            <h3 className="text-2xl font-bold m-0 text-black">Step 1: Import Quiz JSON</h3>
          </div>
          <div className="p-[30px] md:p-5">
            {/* Tabs */}
            <div className="mb-5">
              <ul className="flex list-none p-0 m-0 border-b-2 border-black" role="tablist">
                <li role="presentation">
                  <button
                    className={`p-[10px_20px] border-none bg-transparent cursor-pointer text-base border-b-4 -mb-[2px] hover:bg-gray-50 md:p-2 md:text-sm ${activeTab === 'upload' ? 'border-black font-bold' : 'border-transparent'}`}
                    onClick={() => setActiveTab('upload')}
                  >
                    ▸ Upload JSON File
                  </button>
                </li>
                <li role="presentation">
                  <button
                    className={`p-[10px_20px] border-none bg-transparent cursor-pointer text-base border-b-4 -mb-[2px] hover:bg-gray-50 md:p-2 md:text-sm ${activeTab === 'paste' ? 'border-black font-bold' : 'border-transparent'}`}
                    onClick={() => setActiveTab('paste')}
                  >
                    □ Paste JSON Text
                  </button>
                </li>
              </ul>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <form onSubmit={handleSubmit} className="block">
                <div className="mb-5">
                  <label htmlFor="jsonFile" className="block font-semibold mb-2 text-black">Select JSON File</label>
                  <input
                    type="file"
                    id="jsonFile"
                    className="w-full p-2.5 border border-black bg-white font-mono text-[0.9rem] focus:outline-2 focus:outline-black focus:outline-offset-2"
                    ref={fileInputRef}
                    accept=".json"
                    required
                  />
                  <small className="block mt-[5px] text-gray-600 text-[0.85rem]">
                    Upload a .json file containing your quiz structure
                  </small>
                </div>

                <div className="text-center mt-5">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <span className="mr-2 text-[1.2em]">▶</span> Parse & Edit
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Paste Tab */}
            {activeTab === 'paste' && (
              <form onSubmit={handleSubmit} className="block">
                <div className="mb-5">
                  <label htmlFor="jsonText" className="block font-semibold mb-2 text-black">Paste JSON Content</label>
                  <textarea
                    id="jsonText"
                    className="w-full p-2.5 border border-black bg-white font-mono text-[0.9rem] resize-y focus:outline-2 focus:outline-black focus:outline-offset-2"
                    ref={textAreaRef}
                    rows={15}
                    placeholder='{"title": "My Quiz", "description": "...", "questions": [...]}'
                    required
                  />
                  <small className="block mt-[5px] text-gray-600 text-[0.85rem]">Paste your JSON quiz structure here</small>
                </div>

                <div className="text-center mt-5">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <span className="mr-2 text-[1.2em]">▶</span> Parse & Edit
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Format Guide */}
            <div className="p-5 border border-gray-300 mt-5 bg-gray-50 text-[0.9rem]">
              <h6 className="m-0 mb-2.5 text-base font-bold text-black">
                <strong>JSON Format Guide:</strong>
              </h6>
              <p className="my-1 text-gray-800">Your JSON should follow this structure:</p>
              <pre className="bg-white border border-gray-300 p-2.5 overflow-x-auto my-2.5">
                <code className="font-mono text-[0.85rem] leading-relaxed">{`{
  "title": "Quiz Title",
  "description": "Quiz description",
  "questions": [
    {
      "type": "MC",
      "title": "Question 1",
      "prompt": "What is 2+2?",
      "points": 1.0,
      "answers": [
        {"text": "3", "correct": false},
        {"text": "4", "correct": true}
      ]
    }
  ]
}`}</code>
              </pre>
              <small className="block mt-2.5 text-gray-700 font-medium">
                <strong>Supported Types:</strong> MC (Multiple Choice), MA (Multiple Answer), MD
                (Multiple Dropdown), MT (Matching), TF (True/False)
              </small>
            </div>
          </div>
        </div>

        <div className="text-center p-5 mt-10 border-t-2 border-black text-gray-600 text-[0.9rem]">
          <p>QTI Helper v2.0 | QTI 1.2 Converter</p>
        </div>
      </div>
    </div>
  );
}
