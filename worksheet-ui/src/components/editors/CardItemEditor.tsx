import type { CardItem } from '../../types/worksheet';

interface CardItemEditorProps {
  item: CardItem;
  onUpdate: (item: CardItem) => void;
}

export function CardItemEditor({ item, onUpdate }: CardItemEditorProps) {
  return (
    <div className="space-y-4">
      <div className="prop-group">
        <h4>Card Styling</h4>

        <div className="mb-4">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={item.showPromptNumber || false}
              onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
            />
            Show Question Number
          </label>
        </div>

        <div className="mb-4">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={item.showBorder ?? true}
              onChange={(e) => onUpdate({ ...item, showBorder: e.target.checked })}
            />
            Show Border
          </label>
        </div>

        {(item.showBorder ?? true) && (
          <div className="mb-4">
            <label className="prop-label">Border Style</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              {(['solid', 'double', 'dashed'] as const).map((style) => (
                <button
                  key={style}
                  className={`flex-1 py-1 text-xs capitalize ${(item.borderStyle || 'solid') === style ? 'bg-black text-white' : 'theme-surface theme-text'}`}
                  onClick={() => onUpdate({ ...item, borderStyle: style })}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="prop-label">Card Style</label>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            {(['note', 'info', 'warning'] as const).map((style) => (
              <button
                key={style}
                className={`flex-1 py-1 text-xs capitalize ${(item.cardStyle || 'note') === style ? 'bg-black text-white' : 'theme-surface theme-text'}`}
                onClick={() => onUpdate({ ...item, cardStyle: style })}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="prop-label">Columns</label>
          <div className="flex border theme-border rounded overflow-hidden">
            {([1, 2, 3] as const).map((num) => (
              <button
                key={num}
                className={`flex-1 py-1 text-xs ${(item.columns || 1) === num ? 'bg-black text-white' : 'theme-surface theme-text'}`}
                onClick={() => onUpdate({ ...item, columns: num })}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="prop-label">Font Size</label>
            <select
              className="prop-select"
              value={item.fontSize || '12pt'}
              onChange={(e) => onUpdate({ ...item, fontSize: e.target.value })}
            >
              <option value="10pt">10pt</option>
              <option value="11pt">11pt</option>
              <option value="12pt">12pt</option>
              <option value="14pt">14pt</option>
              <option value="16pt">16pt</option>
              <option value="18pt">18pt</option>
            </select>
          </div>
          <div>
            <label className="prop-label">Font Weight</label>
            <select
              className="prop-select"
              value={item.fontWeight || 'normal'}
              onChange={(e) => onUpdate({ ...item, fontWeight: e.target.value as 'normal' | 'bold' })}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="prop-label">Text Alignment</label>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            {(['left', 'center', 'right', 'justify'] as const).map((align) => (
              <button
                key={align}
                className={`flex-1 py-1 text-xs capitalize ${item.textAlign === align || (!item.textAlign && align === 'left') ? 'bg-black text-white' : 'theme-surface theme-text'}`}
                onClick={() => onUpdate({ ...item, textAlign: align })}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div>
            <label className="prop-label">Top Margin (mm)</label>
            <input
              type="text"
              className="prop-input"
              value={item.marginTop || '0.5'}
              placeholder="0.5"
              onChange={(e) => onUpdate({ ...item, marginTop: e.target.value + 'mm' })}
            />
          </div>
          <div>
            <label className="prop-label">Bottom Margin (mm)</label>
            <input
              type="text"
              className="prop-input"
              value={item.marginBottom || '0.5'}
              placeholder="0.5"
              onChange={(e) => onUpdate({ ...item, marginBottom: e.target.value + 'mm' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
