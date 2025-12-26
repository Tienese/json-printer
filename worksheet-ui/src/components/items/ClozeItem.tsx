import { useRef, useCallback, useEffect, type FC } from 'react';
import type { ClozeItem, ViewMode } from '../../types/worksheet';
import { QuestionNumber } from '../shared/QuestionNumber';

interface Props {
  item: ClozeItem;
  mode: ViewMode;
  onUpdate?: (item: ClozeItem) => void;
}

// Parse template into parts (text and blanks)
function parseTemplate(template: string, answers: string[]) {
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankIndex?: number }> = [];
  const regex = /\{\{blank\}\}/gi;
  let lastIndex = 0;
  let blankIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: template.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'blank', content: answers[blankIndex] || '', blankIndex });
    blankIndex++;
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    parts.push({ type: 'text', content: template.slice(lastIndex) });
  }

  return parts;
}

// Generate label based on list style
const getLabel = (style: string, index: number): string => {
  switch (style) {
    case 'number': return `${index + 1}.`;
    case 'letter': return `${String.fromCharCode(97 + index)}.`;
    case 'roman': {
      const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return `${romanArr[index] || index + 1}.`;
    }
    case 'bullet': return '•';
    default: return '';
  }
};

// Blank component for teacher mode (editable)
function EditableBlank({
  content,
  blankIndex,
  onBlur
}: {
  content: string;
  blankIndex: number;
  onBlur: (index: number, value: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== content) {
      ref.current.textContent = content;
    }
  }, [content]);

  return (
    <span
      ref={ref}
      className="border-b-2 border-black px-1 min-w-[2cm] inline-block font-bold"
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onBlur(blankIndex, e.currentTarget.textContent || '')}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
      data-testid={`cloze-blank-${blankIndex}`}
    />
  );
}

// Blank component for student mode (read-only underline)
function StudentBlank({ width }: { width: string }) {
  return (
    <span
      className="inline-block border-b border-black mx-1"
      style={{ width }}
    >
      &nbsp;
    </span>
  );
}

export const ClozeItemComponent: FC<Props> = ({ item, mode, onUpdate }) => {
  const lines = item.template.split('\n');

  const handleBlankChange = useCallback((blankIndex: number, value: string) => {
    if (!onUpdate) return;

    const newAnswers = [...item.answers];
    newAnswers[blankIndex] = value.trim();

    if (JSON.stringify(newAnswers) !== JSON.stringify(item.answers)) {
      onUpdate({ ...item, answers: newAnswers });
    }
  }, [item, onUpdate]);

  // Count blanks to track index across lines
  let globalBlankIndex = 0;

  return (
    <div
      className="mb-[2mm] p-0 print:break-inside-avoid flex items-start"
      data-testid={`cloze-item-${item.id}`}
      data-item-type="CLOZE"
    >
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />

      <div className="flex-1 text-[11pt] leading-[1.4]">
        {lines.map((line, lineIndex) => {
          const parts = parseTemplate(line, item.answers);
          const showLabel = item.listStyle && item.listStyle !== 'none';

          return (
            <div key={lineIndex} className="flex items-baseline mb-1">
              {showLabel && (
                <span className="mr-2 font-medium text-gray-700 select-none min-w-[1.5em]">
                  {getLabel(item.listStyle!, lineIndex)}
                </span>
              )}
              <span className="flex-1">
                {parts.map((part, partIndex) => {
                  if (part.type === 'blank') {
                    const currentBlankIndex = globalBlankIndex++;

                    if (mode === 'teacher') {
                      return (
                        <EditableBlank
                          key={partIndex}
                          content={item.answers[currentBlankIndex] || ''}
                          blankIndex={currentBlankIndex}
                          onBlur={handleBlankChange}
                        />
                      );
                    } else {
                      return (
                        <StudentBlank
                          key={partIndex}
                          width={item.blankWidth || '4cm'}
                        />
                      );
                    }
                  }
                  return <span key={partIndex}>{part.content}</span>;
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};