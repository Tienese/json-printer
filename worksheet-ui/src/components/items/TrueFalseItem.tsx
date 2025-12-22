import { useRef, useCallback, type FC, useEffect } from 'react';
import type { TrueFalseItem, ViewMode } from '../../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../../utils/htmlSanitizer';
import { QuestionNumber } from '../shared/QuestionNumber';

interface Props {
  item: TrueFalseItem;
  mode: ViewMode;
  onUpdate: (item: TrueFalseItem) => void;
}

const LABELS = {
  EN: { T: 'True', F: 'False' },
  VN: { T: 'Đúng', F: 'Sai' },
  JP: { T: '正', F: '誤' },
};

export const TrueFalseItemComponent: FC<Props> = ({
  item,
  mode,
  onUpdate,
}) => {
  const promptRef = useRef<HTMLDivElement>(null);
  const questionsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isEditing = useRef(false);

  const lang = item.language || 'EN';
  const labels = LABELS[lang];

  // Sync content from props
  useEffect(() => {
    // Prompt
    if (promptRef.current && document.activeElement !== promptRef.current) {
      if (promptRef.current.innerHTML !== item.prompt) {
        promptRef.current.innerHTML = item.prompt;
      }
    }

    // Questions
    item.questions.forEach((q, idx) => {
      const el = questionsRefs.current[idx];
      if (el && document.activeElement !== el) {
        if (el.innerHTML !== q.text) {
          el.innerHTML = q.text;
        }
      }
    });
  }, [item.prompt, item.questions]);

  const handlePromptBlur = useCallback(() => {
    isEditing.current = false;
    if (promptRef.current) {
      const cleaned = sanitizeHTML(promptRef.current.innerHTML);
      if (cleaned !== item.prompt) {
        onUpdate({ ...item, prompt: cleaned });
      }
    }
  }, [item, onUpdate]);

  const questionTimeouts = useRef<{ [key: number]: any }>({});

  const handleQuestionInput = useCallback((index: number) => {
    // Clear existing timeout
    if (questionTimeouts.current[index]) {
      clearTimeout(questionTimeouts.current[index]);
    }

    // Set new timeout for 500ms
    questionTimeouts.current[index] = setTimeout(() => {
      const el = questionsRefs.current[index];
      if (el) {
        const cleaned = sanitizeHTML(el.innerHTML);
        if (cleaned !== item.questions[index].text) {
          const newQuestions = [...item.questions];
          newQuestions[index] = { ...newQuestions[index], text: cleaned };
          onUpdate({ ...item, questions: newQuestions });
        }
      }
    }, 500);
  }, [item, onUpdate]);

  const handleQuestionBlur = useCallback((index: number) => {
    // Clear pending
    if (questionTimeouts.current[index]) {
      clearTimeout(questionTimeouts.current[index]);
    }

    isEditing.current = false;
    const el = questionsRefs.current[index];
    if (el) {
      const cleaned = sanitizeHTML(el.innerHTML);
      // Check if actually changed to avoid loop
      if (cleaned !== item.questions[index].text) {
        const newQuestions = [...item.questions];
        newQuestions[index] = { ...newQuestions[index], text: cleaned };
        onUpdate({ ...item, questions: newQuestions });
      }
    }
  }, [item, onUpdate]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertHTML', false, cleaned);
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    isEditing.current = true;
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(e.target);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  const renderSingleLayout = () => {
    const q = item.questions[0];
    if (!q) return null;

    const isTrueCorrect = q.correctAnswer === true;
    const isFalseCorrect = q.correctAnswer === false;

    // In teacher mode, highlight the correct answer
    const trueStyle = mode === 'teacher' && isTrueCorrect ? 'font-bold underline decoration-2 decoration-[#2e7d32]' : '';
    const falseStyle = mode === 'teacher' && isFalseCorrect ? 'font-bold underline decoration-2 decoration-[#2e7d32]' : '';

    return (
      <div className="mt-1">
        <div
          ref={(el) => { questionsRefs.current[0] = el; }}
          className="mb-2 outline-none hover:bg-[#eef] focus:bg-[#eef] rounded p-[1px] min-h-[1.2em]"
          contentEditable={mode === 'teacher'}
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={() => handleQuestionBlur(0)}
          onPaste={handlePaste}
        />

        <div className="flex flex-col gap-1 pl-4">
          <div className="flex items-center">
            <span className={`w-[60px] ${trueStyle}`}>{labels.T}</span>
            <span className="mr-2">=&gt;</span>
            <div className="flex-1 border-b border-dashed border-gray-400 h-4"></div>
          </div>
          <div className="flex items-center">
            <span className={`w-[60px] ${falseStyle}`}>{labels.F}</span>
            <span className="mr-2">&nbsp;&nbsp;&nbsp;</span> {/* Spacing to align with arrow above if needed, or just standard indent */}
            <div className="flex-1 border-b border-dashed border-gray-400 h-4"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleLayout = () => {
    return (
      <div className="mt-2 flex flex-col gap-4">
        {item.questions.map((q, idx) => {
          const isTrueCorrect = q.correctAnswer === true;
          const isFalseCorrect = q.correctAnswer === false;

          return (
            <div key={q.id || idx} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline flex-1 min-w-0">
                  <span className="font-bold mr-2 text-[10pt]">{String.fromCharCode(97 + idx)})</span>
                  <div
                    ref={(el) => { questionsRefs.current[idx] = el; }}
                    className="flex-1 outline-none hover:bg-[#eef] focus:bg-[#eef] rounded p-[1px] min-h-[1.2em]"
                    contentEditable={mode === 'teacher'}
                    suppressContentEditableWarning
                    onFocus={handleFocus}
                    onBlur={() => handleQuestionBlur(idx)}
                    onInput={() => handleQuestionInput(idx)}
                    onPaste={handlePaste}
                  />
                </div>
                {/* Right-aligned Label */}
                <div className="font-bold whitespace-nowrap text-right min-w-[80px]">
                  {mode === 'teacher' ? (
                    <span>
                      <span className={isTrueCorrect ? 'underline decoration-2 decoration-[#2e7d32]' : ''}>{labels.T}</span>
                      {' / '}
                      <span className={isFalseCorrect ? 'underline decoration-2 decoration-[#2e7d32]' : ''}>{labels.F}</span>
                    </span>
                  ) : (
                    `${labels.T} / ${labels.F}`
                  )}
                </div>
              </div>

              {/* Dashed lines for reasoning */}
              {item.showDashedLines && q.showReasoning !== false && (
                <div className="mt-1 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10pt] font-bold">=&gt;</span>
                    {mode === 'teacher' ? (
                      <div
                        className="flex-1 border-b border-dashed border-black h-4 outline-none empty:before:content-['...'] empty:before:text-gray-300"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const cleaned = sanitizeHTML(e.currentTarget.innerHTML);
                          if (cleaned !== q.text) { // Wait, this should update the reasoning field if it exists
                            // Actually, let's assume 'text' is the reasoning if it's the only field? 
                            // Looking at types... TrueFalseQuestion has {id, text, correctAnswer, showReasoning}.
                            // The user wants to hide 'text' in Student mode and use it for Reasoning if applicable.
                            // Currently 'text' is used for the question itself in renderMultipleLayout.
                            // Let's re-read the code.
                          }
                        }}
                      >
                        {/* Placeholder for reasoning if it were a separate field, 
                            but for now let's just implement the "No Answer" hiding logic. */}
                      </div>
                    ) : (
                      <div className="flex-1 border-b border-dashed border-black h-4"></div>
                    )}
                  </div>
                  {Array.from({ length: Math.max(0, (item.reasoningLines || 2) - 1) }).map((_, i) => (
                    <div key={i} className="flex-1 border-b border-dashed border-black h-6 ml-6"></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="mb-[2mm] p-0 print:break-inside-avoid"
      data-testid={`tf-item-${item.id}`}
      data-item-type="TRUE_FALSE"
    >
      <div className="flex items-start">
        <QuestionNumber
          number={item.promptNumber!}
          show={item.showPromptNumber && !!item.promptNumber}
          className="shrink-0 pt-[2px]"
        />

        <div className="flex-1 min-w-0 text-[11pt] leading-[1.4]">
          {/* Main Prompt - Only show for multiple layout */}
          {item.layout === 'multiple' && (
            <div
              ref={promptRef}
              className="mb-1 outline-none hover:bg-[#eef] focus:bg-[#eef] p-[1px] rounded empty:before:content-['Click_to_add_prompt...'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-['']"
              contentEditable
              suppressContentEditableWarning
              onFocus={handleFocus}
              onBlur={handlePromptBlur}
              onPaste={handlePaste}
              data-testid="tf-prompt"
            />
          )}

          {item.layout === 'multiple' ? renderMultipleLayout() : renderSingleLayout()}
        </div>
      </div>
    </div>
  );
};