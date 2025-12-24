import { type FC } from 'react';
import type { ClozeItem, ViewMode } from '../../types/worksheet';
import { QuestionNumber } from '../shared/QuestionNumber';

interface Props {
  item: ClozeItem;
  mode: ViewMode;
  onUpdate?: (item: ClozeItem) => void;
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
    case 'none':
    default: return '';
  }
};

export const ClozeItemComponent: FC<Props> = ({
  item,
  mode,
}) => {
  // Split template by newlines and process each line
  const lines = item.template.split('\n');
  const listStyle = item.listStyle || 'none';
  let globalBlankIndex = 0;

  const renderLine = (line: string, lineIndex: number) => {
    const parts = line.split(/({{blank}})/gi);
    const label = listStyle !== 'none' ? getLabel(listStyle, lineIndex) : '';

    return (
      <div key={lineIndex} className="flex items-baseline mb-1">
        {label && <span className="mr-2 font-medium text-gray-700 select-none min-w-[1.5em]">{label}</span>}
        <div className="flex-1 flex flex-wrap items-baseline">
          {parts.map((part, partIndex) => {
            if (part.toLowerCase() === '{{blank}}') {
              const answer = item.answers[globalBlankIndex] || '';
              const currentBlankIndex = globalBlankIndex;
              globalBlankIndex++;

              if (mode === 'teacher') {
                return (
                  <span
                    key={partIndex}
                    className="font-bold text-black border-b border-black px-[4px]"
                    data-testid={`cloze-blank-${currentBlankIndex}`}
                    data-blank-index={currentBlankIndex}
                  >
                    [{answer}]
                  </span>
                );
              } else {
                return (
                  <span
                    key={partIndex}
                    className="inline-block border-b border-black mx-[4px] align-baseline text-transparent"
                    style={{ width: item.blankWidth || '4cm' }}
                    data-testid={`cloze-blank-${currentBlankIndex}`}
                    data-blank-index={currentBlankIndex}
                  >
                    &nbsp;
                  </span>
                );
              }
            }
            return <span key={partIndex} className="whitespace-pre-wrap">{part}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="mb-[2mm] p-0 print:break-inside-avoid flex items-baseline"
      data-testid={`cloze-item-${item.id}`}
      data-item-type="CLOZE"
    >
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />

      <div className="flex-1 text-[11pt] leading-[1.4]" data-testid="cloze-template">
        {lines.map((line, lineIndex) => renderLine(line, lineIndex))}
      </div>
    </div>
  );
};