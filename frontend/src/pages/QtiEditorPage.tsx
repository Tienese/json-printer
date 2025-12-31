import { useState, useEffect } from 'react';
import { ROUTES } from '../navigation/routes';
import { validateQuiz, processQuiz } from '../api/qtiConverter';
import type { Quiz, ValidationResult, QuizSettings } from '../types/qti';
import { QuizSettingsPanel } from '../components/QuizSettingsPanel';
import { Navbar } from '../components/Navbar';

interface QtiEditorPageProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function QtiEditorPage({ onNavigate }: QtiEditorPageProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courseId, setCourseId] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<QuizSettings>({
    quizType: 'assignment',
    allowedAttempts: 1,
    showCorrectAnswers: true,
    shuffleAnswers: false,
    oneQuestionAtATime: false,
    cantGoBack: false,
  });

  useEffect(() => {
    // Load quiz data from sessionStorage
    const storedData = sessionStorage.getItem('qtiQuizData');
    if (!storedData) {
      setError('No quiz data found. Please import a quiz first.');
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setQuiz(parsed);
    } catch (err) {
      setError('Failed to load quiz data');
    }
  }, []);

  const handleValidate = async () => {
    if (!quiz) return;

    setValidating(true);
    setError(null);

    try {
      const result = await validateQuiz(quiz);
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    if (!courseId || courseId.trim() === '') {
      setError('Please enter a Canvas Course ID');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const quizWithSettings = { ...quiz, settings };
      const result = await processQuiz(courseId, quizWithSettings);

      // Store result in sessionStorage for success page
      sessionStorage.setItem('qtiProcessResult', JSON.stringify(result));

      // Navigate to success page
      onNavigate(ROUTES.QUIZ_SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process quiz');
      setSubmitting(false);
    }
  };

  if (error && !quiz) {
    return (
      <div className="min-h-screen theme-surface">
        <Navbar onBack={() => onNavigate(ROUTES.QUIZ_IMPORT)} />
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

  if (!quiz) {
    return <div className="text-center p-10 text-xl font-sans theme-surface theme-text">Loading quiz...</div>;
  }

  return (
    <div className="min-h-screen theme-surface">
      <Navbar onBack={() => onNavigate(ROUTES.QUIZ_IMPORT)} />

      <div className="max-w-[1000px] mx-auto p-10 pb-[100px] md:p-5 md:pb-[150px]">
        <div className="text-center mb-10 pb-5 border-b-2 theme-border-strong">
          <h1 className="text-[2.5rem] font-bold theme-text mb-[10px] md:text-[1.8rem]">✏️ Edit Quiz</h1>
          <p className="text-[1.1rem] theme-text-secondary">Review and modify questions before converting to QTI 1.2</p>
        </div>



        {error && (
          <div className="alert alert-error mb-5" role="alert">
            <strong className="font-bold">Error:</strong> {error}
          </div>
        )}

        {/* Quiz Metadata */}
        <div className="border theme-border-strong mb-5 theme-surface">
          <div className="p-[15px_20px] border-b theme-border-strong">
            <h3 className="text-[1.3rem] font-bold m-0 theme-text">Quiz Information</h3>
          </div>
          <div className="p-5">
            <div className="mb-[15px]">
              <label className="block font-semibold mb-[5px] theme-text">Title:</label>
              <div className="p-2.5 theme-elevated border theme-border text-base theme-text">{quiz.title}</div>
            </div>
            {quiz.description && (
              <div className="mb-[15px]">
                <label className="block font-semibold mb-[5px] theme-text">Description:</label>
                <div className="p-2.5 theme-elevated border theme-border text-base theme-text">{quiz.description}</div>
              </div>
            )}
            <div className="mb-[15px]">
              <label className="block font-semibold mb-[5px] theme-text">Total Questions:</label>
              <div className="p-2.5 theme-elevated border theme-border text-base theme-text">{quiz.questions.length}</div>
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="border theme-border-strong mb-5 theme-surface">
          <div className="p-[15px_20px] border-b theme-border-strong">
            <h3 className="text-[1.3rem] font-bold m-0 theme-text">⚙️ Quiz Settings</h3>
          </div>
          <div className="p-5">
            <QuizSettingsPanel settings={settings} onChange={setSettings} />
          </div>
        </div>

        {/* Validation Section */}
        <div className="border theme-border-strong mb-5 theme-surface">
          <div className="p-5">
            <div className="flex justify-between items-center mb-[15px]">
              <h6 className="m-0 text-[1.1rem] font-bold theme-text">✓ Validation</h6>
              <button
                onClick={handleValidate}
                className="h-10 px-4 font-bold border-2 theme-border-strong text-sm theme-text"
                disabled={validating}
              >
                {validating ? 'Validating...' : 'Validate JSON'}
              </button>
            </div>

            {validation && (
              <div className="mt-[15px]">
                {validation.errors.length > 0 && (
                  <div className="p-[15px] border border-red-500 mt-2.5 border-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                    <strong className="font-bold">⚠️ Errors:</strong>
                    <ul className="m-0 mt-2.5 ml-5 list-disc p-0">
                      {validation.errors.map((err, idx) => (
                        <li key={idx} className="mb-[5px]">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="p-[15px] border border-amber-500 mt-2.5 border-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                    <strong className="font-bold">⚠ Warnings:</strong>
                    <ul className="m-0 mt-2.5 ml-5 list-disc p-0">
                      {validation.warnings.map((warn, idx) => (
                        <li key={idx} className="mb-[5px]">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.valid && validation.errors.length === 0 && (
                  <div className="p-[15px] border border-green-500 mt-2.5 border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-medium">✓ JSON is valid - no errors found!</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="border theme-border-strong mb-5 theme-surface">
          <div className="p-[15px_20px] border-b theme-border-strong">
            <h3 className="text-[1.3rem] font-bold m-0 theme-text">Questions ({quiz.questions.length})</h3>
          </div>
          <div className="p-5">
            {quiz.questions.map((question, index) => (
              <div key={index} className="border theme-border p-[15px] mb-[15px] theme-elevated last:mb-0">
                <div className="flex gap-2.5 items-center mb-2.5 font-semibold">
                  <span className="text-[1.1rem] font-bold theme-text">Q{index + 1}</span>
                  <span className="bg-[var(--color-accent)] text-white px-2 py-0.5 text-[0.85rem] rounded-[3px]">[{question.type}]</span>
                  <span className="ml-auto text-[0.9rem] theme-text-secondary">{question.points} pts</span>
                </div>
                <div className="text-base mb-2.5 leading-relaxed theme-text">{question.prompt}</div>
                {question.answers && question.answers.length > 0 && (
                  <div className="mt-2.5 pl-[15px]">
                    {question.answers.map((answer, aIdx) => (
                      <div
                        key={aIdx}
                        className={`mb - [5px] text - [0.9rem] flex gap - 2 items - start ${answer.correct ? 'font-semibold text-green-700 dark:text-green-400' : 'theme-text-secondary'} `}
                      >
                        <span className="font-bold min-w-[20px]">{answer.correct ? '✓' : '○'}</span>
                        <span>{answer.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Process Form */}
        <div className="fixed bottom-0 left-0 right-0 theme-surface border-t-2 theme-border-strong shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[100] m-0">
          <div className="p-5 max-w-[1000px] mx-auto md:p-[15px]">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[2fr_1fr] gap-5 items-end md:grid-cols-1">
                <div className="flex flex-col">
                  <label htmlFor="courseId" className="font-bold mb-[5px] theme-text">Canvas Course ID</label>
                  <input
                    type="text"
                    id="courseId"
                    className="p-2.5 border theme-border-strong font-sans text-base focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 theme-surface theme-text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="e.g., 12345"
                    required
                  />
                  <small className="mt-[5px] theme-text-secondary text-[0.85rem]">Enter the Canvas course ID where you want to import this question bank</small>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="h-12 px-8 font-bold bg-[var(--color-accent)] text-white border-2 border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed md:mt-2.5" disabled={submitting}>
                    {submitting ? 'Processing...' : '🎯 Generate QTI & Import'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center p-5 mt-10 theme-text-secondary text-[0.9rem]">
          <small>QTI Helper v2.0 | Step 2: Review & Process</small>
        </div>
      </div>
    </div>
  );
}
