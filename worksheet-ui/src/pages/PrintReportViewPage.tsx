import { useState, useEffect } from 'react';
import { ROUTES } from '../navigation/routes';
import type { QuizPrintViewModel } from '../types/printReport';
import {
  MatchingQuestionRenderer,
  FillInBlankRenderer,
  EssayQuestionRenderer,
  TrueFalseRenderer,
  ShortAnswerRenderer
} from '../components/QuestionRenderers';
import { Spinner } from '../components/ui';
import { triggerBrowserPrint } from '../utils/print';

interface PrintReportViewPageProps {
  onNavigate: (route: string) => void;
}

export function PrintReportViewPage({ onNavigate }: PrintReportViewPageProps) {
  const [reportData, setReportData] = useState<QuizPrintViewModel[] | null>(null);
  const [editMode, setEditMode] = useState(false);
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
      component: "PrintReportViewPage",
      target: { testid: "print-btn", label: "Print", state: "enabled" },
      payload: {}
    }));
    triggerBrowserPrint();
  };

  const toggleEditMode = () => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "TOGGLE_EDIT",
      component: "PrintReportViewPage",
      target: { testid: "edit-toggle", label: "Edit Mode", state: !editMode ? "active" : "inactive" },
      payload: { newState: !editMode }
    }));
    setEditMode(!editMode);
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
        <Spinner text="Rendering Dossier..." />
      </div>
    );
  }

  const editFieldClass = editMode ? "border-b-2 border-dashed border-primary-blue bg-selected-bg cursor-text" : "";

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
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">REPORT VIEW</div>
          <button
            onClick={toggleEditMode}
            className={`toolbar-btn ${editMode ? 'bg-primary-blue text-white border-primary-blue' : ''}`}
            data-testid="edit-toggle"
          >
            {editMode ? '✓ Done Editing' : '✎ Edit Mode'}
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            onClick={handlePrint}
            className="toolbar-btn !bg-black !text-white !border-black"
            data-testid="print-btn"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="max-w-[21cm] mx-auto mt-[80px] mb-10 p-[0.5cm] bg-white font-sans print:m-0 print:p-[0.5cm] print:max-w-none shadow-2xl print:shadow-none min-h-[29.7cm]">
        {reportData.map((quiz, quizIndex) => (
          <div key={quizIndex}>
            {quiz.students.map((student, studentIndex) => (
              <div
                key={studentIndex}
                className={`print:break-inside-avoid ${studentIndex > 0 ? 'print:break-before-page' : ''} mb-8 print:mb-0`}
              >
                {/* Student Metadata Header */}
                <div className="border-b-2 border-black mb-4 pb-2 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">STUDENT</span>
                    <span className={`text-xl font-black uppercase ${editFieldClass}`}>{student.studentName}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">ID / REF</span>
                    <span className={`text-base font-bold ${editFieldClass}`}>{student.studentId || 'N/A'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl font-black text-center mb-1 uppercase tracking-tight">{quiz.quizTitle}</h1>
                  <div className="text-center text-[8px] font-bold text-gray-400 tracking-[0.2em]">CANVAS COMPREHENSIVE DOSSIER</div>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {student.questions.map((question) => (
                    <div key={question.questionNumber} className="print:break-inside-avoid border-l border-gray-100 pl-4 relative">
                      <div className="flex items-start gap-3">
                        <span className="font-black text-sm bg-black text-white w-6 h-6 flex items-center justify-center shrink-0">
                          {question.questionNumber}
                        </span>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              {question.answerStatus === 'CORRECT' && <span className="text-lg font-bold text-black" aria-label="Correct">✓</span>}
                              {question.answerStatus === 'INCORRECT' && <span className="text-lg font-bold text-black" aria-label="Incorrect">✗</span>}
                              {question.answerStatus === 'MISSED' && <span className="text-lg font-bold text-gray-400" aria-label="Unanswered">▲</span>}
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{question.questionType.replace('_', ' ')}</span>
                            </div>
                            <span className="text-[10px] font-black italic">{question.pointsPossible} PTS</span>
                          </div>

                          <div
                            className={`text-[10pt] leading-snug mb-2 text-black font-medium ${editFieldClass}`}
                            dangerouslySetInnerHTML={{ __html: question.questionText }}
                          />

                          {/* Question Type Specific Rendering */}
                          {(() => {
                            const qType = question.questionType.toLowerCase();

                            // Matching Question
                            if (qType.includes('matching')) {
                              return <MatchingQuestionRenderer question={question} editMode={editMode} editFieldClass={editFieldClass} />;
                            }

                            // Fill in the Blank
                            if (qType.includes('fill_in') || qType.includes('blank')) {
                              return <FillInBlankRenderer question={question} editMode={editMode} editFieldClass={editFieldClass} />;
                            }

                            // Essay
                            if (qType.includes('essay')) {
                              return <EssayQuestionRenderer question={question} />;
                            }

                            // True/False
                            if (qType.includes('true_false')) {
                              return <TrueFalseRenderer question={question} editFieldClass={editFieldClass} />;
                            }

                            // Short Answer
                            if (qType.includes('short_answer')) {
                              return <ShortAnswerRenderer question={question} editFieldClass={editFieldClass} />;
                            }

                            // Multiple Choice/Multiple Answer (default with options)
                            if (question.hasOptions) {
                              return (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-baseline gap-2 text-[9pt]">
                                      <div className={`w-3 h-3 border border-black shrink-0 translate-y-0.5 ${option.isStudentAnswer ? 'bg-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white'}`}></div>
                                      <span className="font-black w-3">{option.optionLetter}.</span>
                                      <span
                                        className={`flex-1 ${editFieldClass} ${option.isStudentAnswer && !option.isCorrect ? 'line-through decoration-1' : ''
                                          } ${option.isCorrect ? 'font-bold' : 'text-gray-700'}`}
                                      >
                                        {option.optionText}
                                        {option.isCorrect && <span className="ml-1 inline-block text-[8pt]">✓</span>}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }

                            return null;
                          })()}

                          {question.feedbackText && (
                            <div className="bg-gray-50 border-l-2 border-black p-2 mt-2">
                              <div
                                className="text-[9pt] text-gray-800 italic leading-tight"
                                dangerouslySetInnerHTML={{ __html: question.feedbackText }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {student.incorrectQuestionNumbers.length > 0 && (
                  <div className="mt-8 pt-4 border-t-2 border-black print:break-inside-avoid">
                    <h3 className="text-sm font-black uppercase tracking-[0.1em] mb-2">REMEDIATION REQUIRED</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {student.incorrectQuestionNumbers.map(num => (
                        <span key={num} className="border border-black px-2 py-0.5 font-black text-xs">{num}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-10 text-center text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] hidden print:block">
                  CONFIDENTIAL STUDENT EVALUATION DATA
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
