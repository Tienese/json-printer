import { type FC } from 'react';
import type { ClozeItem, ViewMode } from '../../types/worksheet';
import { QuestionNumber } from '../shared/QuestionNumber';

interface Props {
  item: ClozeItem;
  mode: ViewMode;
  onUpdate?: (item: ClozeItem) => void;
}

export const ClozeItemComponent: FC<Props> = ({
  item,
  mode,
}) => {
  const parts = item.template.split(/(\{\{blank\}\})/gi);
  let blankIndex = 0;

  return (
    <div
      className="mb-[4mm] p-0 print:break-inside-avoid flex items-baseline"
      data-testid={`cloze-item-${item.id}`}
      data-item-type="CLOZE"
    >
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />

      <div className="flex-1 text-[11pt] leading-[1.4]" data-testid="cloze-template">
        {parts.map((part, partIndex) => {
          if (part.toLowerCase() === '{{blank}}') {
            const answer = item.answers[blankIndex] || '';
            const currentBlankIndex = blankIndex;
            blankIndex++;

            if (mode === 'teacher') {
              return (
                <span
                  key={partIndex}
                  className="font-bold text-blue-700 bg-blue-50 px-[4px] rounded-[2px] border-b border-blue-200"
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