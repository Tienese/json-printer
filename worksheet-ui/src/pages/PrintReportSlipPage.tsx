import { useState, useEffect } from 'react';
import { ROUTES } from '../navigation/routes';
import type { QuizPrintViewModel } from '../types/printReport';
import { Spinner } from '../components/ui';
import { triggerBrowserPrint } from '../utils/print';

interface PrintReportSlipPageProps {
  onNavigate: (route: string) => void;
}

export function PrintReportSlipPage({ onNavigate }: PrintReportSlipPageProps) {
  const [reportData, setReportData] = useState<QuizPrintViewModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load report data from sessionStorage
    const storedData = sessionStorage.getItem('printReportData');
    if (!storedData) {
      setError('No report data found. Please generate a report first.');
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setReportData(Array.isArray(parsed) ? parsed : [parsed]);
    } catch (err) {
      setError('Failed to load report data');
    }
  }, []);

  const handlePrint = () => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "CLICK_PRINT",
      component: "PrintReportSlipPage",
      target: { testid: "print-btn", label: "Print Slips", state: "enabled" },
      payload: {}
    }));
    triggerBrowserPrint();
  };

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto mt-10 p-10 text-center font-sans bg-white border-4 border-black">
        <h1 className="text-3xl font-black text-black mb-6 uppercase">Error</h1>
        <p className="text-lg mb-8">{error}</p>
        <button className="btn btn-primary" onClick={() => onNavigate(ROUTES.HOME)}>
          &larr; Back to Home
        </button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Spinner text="Generating Slips..." />
      </div>
    );
  }

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
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">SLIP GENERATOR</div>
          <button
            onClick={handlePrint}
            className="toolbar-btn !bg-black !text-white !border-black"
            data-testid="print-btn"
          >
            🖨️ Print Slips
          </button>
        </div>
      </div>

      <div className="max-w-[21cm] mx-auto mt-[60px] mb-10 p-[0.5cm] font-sans bg-white print:m-0 print:p-0 print:max-w-none shadow-2xl print:shadow-none">
        {reportData.map((quiz, quizIndex) => (
          <div key={quizIndex}>
            {quiz.students.map((student, studentIndex) => {
              const incorrectQuestions = student.questions.filter(
                (q) => q.answerStatus !== 'CORRECT'
              );

              return (
                <div key={studentIndex} className="print:break-inside-avoid mb-[20px]">
                  <div className="border-2 border-black p-4 relative overflow-hidden">
                    {/* Cut Marker Label */}
                    <div className="absolute top-0 right-0 bg-black text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-widest print:hidden">
                      CUT
                    </div>

                    <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-end">
                      <div className="flex-[2]">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">RETAKE AUTH</span>
                        <div className="text-xl font-black leading-tight uppercase italic">{student.studentName}</div>
                        <div className="text-[9px] font-bold text-gray-600">
                          ID: {student.studentId || 'N/A'} | {quiz.quizTitle}
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="inline-flex flex-col items-center border-border-black p-1.5 bg-gray-50">
                          <span className="text-[7px] font-black uppercase mb-0.5">MISS</span>
                          <span className="text-xl font-black">{student.incorrectQuestionNumbers.length}</span>
                        </div>
                      </div>
                    </div>

                    {student.incorrectQuestionNumbers.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-300">
                        <h3 className="text-lg font-black m-0 tracking-widest uppercase italic">★ Perfect ★</h3>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-black text-white text-[8px] tracking-tighter uppercase">
                              <th className="text-left p-1 w-[8%]">Q#</th>
                              <th className="text-left p-1 w-[32%]">Error</th>
                              <th className="text-left p-1 w-[60%]">Correction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {incorrectQuestions.map((question) => (
                              <tr key={question.questionNumber} className="border-b border-gray-100 last:border-b-0">
                                <td className="p-1.5 align-top font-black text-base">{question.questionNumber}</td>

                                <td className="p-1.5 align-top">
                                  <div className="text-[9pt] line-through text-gray-400 font-medium">
                                    {question.studentAnswerText || '[EMPTY]'}
                                  </div>
                                </td>

                                <td className="p-1.5 align-top">
                                  {question.hasOptions && (
                                    <div className="space-y-1">
                                      {question.options
                                        .filter((opt) => opt.isCorrect)
                                        .map((option, idx) => (
                                          <div key={idx} className="flex items-start gap-1">
                                            <span className="font-bold text-[9pt]">
                                              {option.optionLetter}. {option.optionText}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                  {question.feedbackText && (
                                    <div
                                      className="italic mt-1 text-[8pt] text-gray-600 leading-tight"
                                      dangerouslySetInnerHTML={{ __html: question.feedbackText }}
                                    />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 pt-2 border-t border-black flex justify-between items-center italic text-[7px] font-black uppercase tracking-widest text-gray-400">
                      <span>STAPLE TO BOOKLET</span>
                      <span>QTI HELPER v3.5</span>
                    </div>
                  </div>

                  {studentIndex < quiz.students.length - 1 && (
                    <div className="border-b-2 border-dotted border-gray-300 my-6 relative h-0">
                      <span className="absolute right-0 -top-3 text-lg text-gray-200">✂</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
