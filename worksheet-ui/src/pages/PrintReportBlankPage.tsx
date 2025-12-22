import { useState, useEffect } from 'react';
import { ROUTES } from '../navigation/routes';
import { useNavigation } from '../navigation/useNavigation';
import { getBlankQuiz } from '../api/printReport';
import type { QuizPrintViewModel } from '../types/printReport';
import { Spinner } from '../components/ui';
import { triggerBrowserPrint } from '../utils/print';

interface PrintReportBlankPageProps {
  onNavigate: (route: string) => void;
}

export function PrintReportBlankPage({ onNavigate }: PrintReportBlankPageProps) {
  const { params } = useNavigation();
  const [reportData, setReportData] = useState<QuizPrintViewModel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Try to load from sessionStorage first
      const storedData = sessionStorage.getItem('printReportData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setReportData(Array.isArray(parsed) ? parsed : [parsed]);
          setLoading(false);
          return;
        } catch (err) {
          console.error('Failed to parse stored report data', err);
        }
      }

      // 2. If not in session, try to fetch from API using URL params
      const { courseId, quizId } = params;
      if (courseId && quizId) {
        try {
          const data = await getBlankQuiz(courseId, quizId);
          setReportData([data]);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch blank quiz', err);
          setError('Failed to load blank quiz from Canvas. Please verify the IDs and your connection.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('No report data found and no IDs provided. Please select a quiz from the dashboard.');
        setLoading(false);
      }
    };

    fetchData();
  }, [params.courseId, params.quizId]);

  const handlePrint = () => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "CLICK_PRINT",
      component: "PrintReportBlankPage",
      target: { testid: "print-btn", label: "Print Worksheet", state: "enabled" },
      payload: {}
    }));
    triggerBrowserPrint();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Spinner text="Formatting Worksheet..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto mt-10 p-10 text-center font-sans bg-white border-4 border-black">
        <h1 className="text-3xl font-black text-black mb-6 uppercase">Sync Error</h1>
        <p className="text-lg mb-8">{error}</p>
        <button className="btn btn-primary" onClick={() => onNavigate(ROUTES.HOME)}>
          &larr; Return to Home
        </button>
      </div>
    );
  }

  if (!reportData) {
    return <div className="text-center p-20 font-black uppercase tracking-widest">Null Data Integrity Failure</div>;
  }

  // Calculate total points
  const totalPoints = reportData[0]?.students[0]?.questions.reduce(
    (sum, q) => sum + q.pointsPossible,
    0
  );

  return (
    <div className="bg-app-gray min-h-screen print:bg-white">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b-2 border-black p-3 flex justify-between items-center z-[1000] shadow-md print:hidden">
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate(ROUTES.HOME)}
            className="toolbar-btn"
            data-testid="back-dash-btn"
          >
            &larr; Home
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">WORKSHEET PREVIEW</div>
          <button
            onClick={handlePrint}
            className="toolbar-btn !bg-black !text-white !border-black"
            data-testid="print-btn"
          >
            🖨️ Print Worksheet
          </button>
        </div>
      </div>

      <div className="max-w-[21cm] mx-auto mt-[80px] mb-10 p-[0.5cm] font-sans bg-white print:m-0 print:p-[0.5cm] print:max-w-none shadow-2xl print:shadow-none min-h-[29.7cm]">
        {reportData.map((quiz, quizIndex) =>
          quiz.students.map((student, studentIndex) => (
            <div key={`${quizIndex}-${studentIndex}`} className="bg-white">
              {/* Institutional Header */}
              <div className="border-2 border-black p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-end gap-3">
                    <span className="text-[8px] font-black uppercase tracking-widest w-[100px] pb-0.5">NAME</span>
                    <div className="flex-1 border-b-2 border-black h-6"></div>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-[8px] font-black uppercase tracking-widest w-[100px] pb-0.5">ID</span>
                    <div className="flex-1 border-b-2 border-black h-6"></div>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-[8px] font-black uppercase tracking-widest w-[100px] pb-0.5">DATE</span>
                    <div className="flex-1 border-b-2 border-black h-6"></div>
                  </div>
                </div>
              </div>

              {/* Worksheet Title Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black mb-1 uppercase tracking-tighter">{quiz.quizTitle}</h1>
                <div className="flex justify-center items-center gap-4 text-[8px] font-black uppercase tracking-[0.1em] text-gray-400">
                  <span>{student.questions.length} Items</span>
                  <span className="text-black">◆</span>
                  <span>{totalPoints} Points Total</span>
                </div>
              </div>

              <div className="border-l-4 border-black bg-gray-50 p-3 mb-6 text-[9pt] leading-tight italic">
                <strong>Protocol:</strong> Provide the most accurate response for each item. Ensure handwriting is legible.
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {student.questions.map((question, qIndex) => (
                  <div key={qIndex} className="mb-4 print:break-inside-avoid relative">
                    <div className="flex items-start gap-4">
                      <span className="text-lg font-black leading-none pt-0.5">{question.questionNumber}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-2">
                          <span
                            className="text-[11pt] font-bold leading-snug text-black"
                            dangerouslySetInnerHTML={{ __html: question.questionText }}
                          />
                          <span className="text-[9px] font-black italic whitespace-nowrap ml-2">[{question.pointsPossible}P]</span>
                        </div>

                        {/* Multiple Choice / Multiple Answers / True False */}
                        {(question.questionType === 'multiple_choice_question' ||
                          question.questionType === 'multiple_answers_question' ||
                          question.questionType === 'true_false_question') &&
                          question.hasOptions && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-baseline gap-2">
                                  <div className="w-4 h-4 border-2 border-black shrink-0 translate-y-0.5"></div>
                                  <span className="font-black text-[10pt] w-4">{option.optionLetter}.</span>
                                  <span className="text-[10pt] text-black font-medium">{option.optionText}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* Essay Question */}
                        {question.questionType === 'essay_question' && (
                          <div className="mt-2 space-y-3">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="border-b border-gray-200 h-8 w-full"></div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer */}
                        {question.questionType === 'short_answer_question' && (
                          <div className="mt-2 border-b-2 border-black h-8 w-full max-w-[300px]"></div>
                        )}

                        {/* Matching */}
                        {question.questionType === 'matching_question' && question.hasOptions && (
                          <div className="mt-4 space-y-2 pl-3 border-l-2 border-gray-100">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-end gap-3">
                                <span className="font-black text-[10pt] min-w-[15px]">{option.optionLetter}.</span>
                                <span className="text-[10pt] font-medium leading-none pb-0.5">{option.optionText}</span>
                                <div className="flex-1 border-b border-black min-w-[80px] h-5"></div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fill in Blanks / Multiple Dropdowns */}
                        {(question.questionType === 'fill_in_multiple_blanks_question' ||
                          question.questionType === 'multiple_dropdowns_question') &&
                          question.hasOptions && (
                            <div className="mt-4 space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-end gap-3">
                                  <span className="font-black text-[8px] uppercase tracking-widest text-gray-400">({option.optionLetter})</span>
                                  <div className="flex-1 border-b border-black h-5"></div>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* Numerical */}
                        {question.questionType === 'numerical_question' && (
                          <div className="mt-4 flex items-end gap-3">
                            <span className="font-black text-[8px] uppercase tracking-widest">VALUE</span>
                            <div className="flex-1 border-b-2 border-black h-8 max-w-[150px]"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t-2 border-black text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300 italic">PROTOCOL TERMINATED • END OF EVALUATION</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
