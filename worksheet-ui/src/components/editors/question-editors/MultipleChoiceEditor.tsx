import { useState, useEffect, type FC } from 'react';
import type { MultipleChoiceItem } from '../../../types/worksheet';

interface Props {
  item: MultipleChoiceItem;
  onUpdate: (item: MultipleChoiceItem) => void;
}

export const MultipleChoiceEditor: FC<Props> = ({ item, onUpdate }) => {
  const [localOptions, setLocalOptions] = useState(item.options);

  useEffect(() => {
    setLocalOptions(item.options);
  }, [item.options]);

  const handleAddOption = () => {
    if (localOptions.length >= 6) return;
    const newOptions = [...localOptions, `Option ${localOptions.length + 1}`];
    setLocalOptions(newOptions);
    onUpdate({ ...item, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (localOptions.length <= 2) return;
    const newOptions = localOptions.filter((_, i) => i !== index);
    const newCorrectIndex = item.correctIndex >= newOptions.length
      ? newOptions.length - 1
      : item.correctIndex > index
        ? item.correctIndex - 1
        : item.correctIndex;
    setLocalOptions(newOptions);
    onUpdate({ ...item, options: newOptions, correctIndex: newCorrectIndex });
  };

  const handleCorrectChange = (index: number) => {
    onUpdate({ ...item, correctIndex: index });
  };

  return (
    <div className="prop-group" data-testid="mc-editor">
      <h4>Multiple Choice Properties</h4>

      <label className="prop-label">Columns</label>
      <div className="flex border border-gray-300 rounded overflow-hidden mb-3">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`flex-1 py-1 text-xs ${
              (item.columns || 1) === num
                ? 'bg-primary-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onUpdate({ ...item, columns: num })}
          >
            {num}
          </button>
        ))}
      </div>

      <label className="prop-label">Options ({localOptions.length}/6)</label>
      <div className="space-y-1.5" data-testid="mc-options-list">
        {localOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-1.5" data-testid={`mc-option-row-${index}`}>
            <input
              type="radio"
              name={`correct-${item.id}`}
              checked={item.correctIndex === index}
              onChange={() => handleCorrectChange(index)}
              className="accent-blue-600"
              data-testid={`mc-correct-radio-${index}`}
              title="Mark as correct answer"
            />
            <span className="flex-1 text-sm text-gray-700 truncate px-2 py-1 bg-gray-50 rounded border border-gray-200">
              {String.fromCharCode(65 + index)}. {option}
            </span>
            <button
              className="btn-remove"
              onClick={() => handleRemoveOption(index)}
              disabled={localOptions.length <= 2}
              data-testid={`mc-remove-btn-${index}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn-add"
        onClick={handleAddOption}
        disabled={localOptions.length >= 6}
        data-testid="mc-add-option-btn"
      >
        + Add Option
      </button>

      <label className="prop-label checkbox-label">
        <input
          type="checkbox"
          checked={item.showPromptNumber}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
          data-testid="mc-show-number-checkbox"
        />
        Show question number
      </label>
    </div>
  );
};
