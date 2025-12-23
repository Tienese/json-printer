import { useRef, useCallback, type FC, useEffect } from 'react';
import type { MultipleChoiceItem, ViewMode } from '../../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../../utils/htmlSanitizer';
import { QuestionNumber } from '../shared/QuestionNumber';
import { createSelectAllContentOnFocus } from '../../utils/inputUtils';

interface Props {
  item: MultipleChoiceItem;
  mode: ViewMode;
  onUpdate: (item: MultipleChoiceItem) => void;
}

export const MultipleChoiceItemComponent: FC<Props> = ({
  item,
  mode,
  onUpdate,
}) => {
  const promptRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Refs to track editing state to prevent cursor jumps
  const isEditingPrompt = useRef(false);
  const editingOptionIndex = useRef<number>(-1);

  // Sync prompt content from props ONLY if not currently editing
  useEffect(() => {
    if (promptRef.current && !isEditingPrompt.current) {
      if (promptRef.current.innerHTML !== item.prompt) {
        promptRef.current.innerHTML = item.prompt;
      }
    }
  }, [item.prompt]);

  // Sync options content from props ONLY if not currently editing that specific option
  useEffect(() => {
    item.options.forEach((option, index) => {
      const el = optionsRefs.current[index];
      if (el && editingOptionIndex.current !== index) {
        if (el.innerHTML !== option) {
          el.innerHTML = option;
        }
      }
    });
  }, [item.options]);

  const handlePromptBlur = useCallback(() => {
    isEditingPrompt.current = false;
    if (promptRef.current) {
      const cleaned = sanitizeHTML(promptRef.current.innerHTML);
      if (cleaned !== item.prompt) {
        onUpdate({ ...item, prompt: cleaned });
      }
    }
  }, [item, onUpdate]);

  const handleOptionBlur = useCallback((index: number) => {
    editingOptionIndex.current = -1;
    if (optionsRefs.current[index]) {
      const cleaned = sanitizeHTML(optionsRefs.current[index]!.innerHTML);
      const newOptions = [...item.options];
      if (newOptions[index] !== cleaned) {
        newOptions[index] = cleaned;
        onUpdate({ ...item, options: newOptions });
      }
    }
  }, [item, onUpdate]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertHTML', false, cleaned);
  }, []);

  return (
    <div
      className="mb-[1mm] p-0 print:break-inside-avoid flex items-baseline"
      data-testid={`mc-item-${item.id}`}
      data-item-type="MULTIPLE_CHOICE"
    >
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />

      <div className="flex-1">
        <div
          ref={promptRef}
          className="mb-[1mm] text-[11pt] leading-[1.4] outline-none focus:outline-dashed focus:outline-1 focus:outline-gray-300 p-[1px] rounded empty:before:content-['Click_to_add_question...'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-['']"
          contentEditable
          suppressContentEditableWarning
          onFocus={createSelectAllContentOnFocus(() => { isEditingPrompt.current = true; })}
          onBlur={handlePromptBlur}
          onPaste={handlePaste}
          data-testid="mc-prompt"
        />

        <div
          className="grid gap-[0.5mm] pl-[5mm]"
          style={{
            gridTemplateColumns: `repeat(${item.columns || 1}, 1fr)`
          }}
          data-testid="mc-options"
        >
          {item.options.map((_, index) => {
            const isCorrect = index === item.correctIndex;
            const showAsCorrect = mode === 'teacher' && isCorrect;
            const letter = String.fromCharCode(65 + index); // A, B, C, D...

            return (
              <div
                key={index}
                className={`flex items-baseline gap-[2mm] text-[10pt] ${showAsCorrect
                  ? 'font-bold underline decoration-2 decoration-[#2e7d32] print:decoration-black'
                  : ''
                  }`}
                data-testid={`mc-option-${index}`}
                data-correct={isCorrect}
              >
                <span className="font-medium w-[5mm] shrink-0">{letter}.</span>
                <span
                  ref={(el) => { optionsRefs.current[index] = el; }}
                  className="flex-1 outline-none focus:outline-dashed focus:outline-1 focus:outline-gray-300 rounded px-[2px] min-w-[20px]"
                  contentEditable={mode === 'teacher'}
                  suppressContentEditableWarning
                  onFocus={createSelectAllContentOnFocus(() => { editingOptionIndex.current = index; })}
                  onBlur={() => handleOptionBlur(index)}
                  onPaste={handlePaste}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};