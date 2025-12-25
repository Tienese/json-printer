import type { FC } from 'react';
import type { ClozeItem } from '../../../types/worksheet';

interface Props {
  item: ClozeItem;
  onUpdate: (item: ClozeItem) => void;
}

/**
 * ClozeEditor - Sidebar editor for Cloze item DISPLAY OPTIONS only.
 * 
 * Template and answers are now edited inline on the canvas.
 * This editor controls how blanks are rendered (width, list style, etc.)
 */
export const ClozeEditor: FC<Props> = ({ item, onUpdate }) => {
  return (
    <div className="prop-group" data-testid="cloze-editor">
      <h4>Cloze Display Options</h4>

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

      <label className="prop-label checkbox-label mt-[10px]">
        <input
          type="checkbox"
          checked={item.showPromptNumber}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
        />
        Show question number
      </label>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
        <strong>Tip:</strong> Edit the template directly on the canvas.
        Type <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{`{{blank}}`}</code> to create a new blank.
      </div>
    </div>
  );
};
