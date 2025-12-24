import { useState, useEffect, type FC } from 'react';
import type { ClozeItem } from '../../../types/worksheet';

interface Props {
  item: ClozeItem;
  onUpdate: (item: ClozeItem) => void;
}

export const ClozeEditor: FC<Props> = ({ item, onUpdate }) => {
  const [localTemplate, setLocalTemplate] = useState(item.template);
  const [localAnswers, setLocalAnswers] = useState(item.answers);

  useEffect(() => {
    setLocalTemplate(item.template);
    setLocalAnswers(item.answers);
  }, [item.id]);

  const handleTemplateChange = (value: string) => {
    setLocalTemplate(value);
    // Don't update parent yet, wait for blur
  };

  const handleTemplateBlur = () => {
    // Count blanks
    const blankCount = (localTemplate.match(/\{\{blank\}\}/gi) || []).length;
    let newAnswers = [...localAnswers];

    if (blankCount > newAnswers.length) {
      // Add blanks
      newAnswers = [...newAnswers, ...Array(blankCount - newAnswers.length).fill('')];
    } else if (blankCount < newAnswers.length) {
      // Trim answers
      newAnswers = newAnswers.slice(0, blankCount);
    }

    setLocalAnswers(newAnswers);
    onUpdate({ ...item, template: localTemplate, answers: newAnswers });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...localAnswers];
    newAnswers[index] = value;
    setLocalAnswers(newAnswers);
    onUpdate({ ...item, answers: newAnswers });
  };

  return (
    <div className="prop-group" data-testid="cloze-editor">
      <h4>Cloze Properties</h4>

      <label className="prop-label">Blank Width (Student View)</label>
      <div className="flex border theme-border rounded overflow-hidden mb-3">
        {['2cm', '4cm', '6cm', '8cm'].map((width) => (
          <button
            key={width}
            className={`flex-1 py-1 text-xs ${(item.blankWidth || '4cm') === width
              ? 'bg-[var(--color-accent)] text-white'
              : 'theme-surface theme-text'
              }`}
            onClick={() => onUpdate({ ...item, blankWidth: width })}
          >
            {width}
          </button>
        ))}
      </div>

      <label className="prop-label">List Style (Multi-line)</label>
      <select
        className="prop-select mb-3"
        value={item.listStyle || 'none'}
        onChange={(e) => onUpdate({ ...item, listStyle: e.target.value as any })}
      >
        <option value="none">None</option>
        <option value="number">1. 2. 3. (Numbers)</option>
        <option value="letter">a. b. c. (Letters)</option>
        <option value="roman">I. II. III. (Roman)</option>
        <option value="bullet">• (Bullets)</option>
      </select>

      <label className="prop-label">Template</label>
      <div className="text-[10px] text-muted mb-[5px]">
        Use <code>{`{{blank}}`}</code> to insert a blank space.
      </div>
      <textarea
        className="prop-input"
        value={localTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
        onBlur={handleTemplateBlur}
        rows={5}
        data-testid="cloze-template-input"
      />

      <label className="prop-label">Answers ({localAnswers.length})</label>
      <div className="fib-answers-list">
        {localAnswers.map((answer, index) => (
          <div key={index} className="mb-[5px]">
            <label className="text-[11px]">Blank {index + 1}:</label>
            <input
              className="prop-input"
              value={answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder={`Answer for blank ${index + 1}`}
              data-testid={`cloze-answer-input-${index}`}
            />
          </div>
        ))}
      </div>

      <label className="prop-label checkbox-label mt-[10px]">
        <input
          type="checkbox"
          checked={item.showPromptNumber}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
        />
        Show question number
      </label>
    </div>
  );
};
