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
          <label className="prop-label">Language</label>
          <select
            className="prop-select"
            value={item.language || 'VI'}
            onChange={(e) => onUpdate({ ...item, language: e.target.value as 'VI' | 'EN' | 'JP' })}
          >
            <option value="VI">Vietnamese (Tiếng Việt)</option>
            <option value="EN">English</option>
            <option value="JP">Japanese (日本語)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="prop-label">Card Title (optional)</label>
          <input
            type="text"
            className="prop-input"
            value={item.cardHeader || ''}
            placeholder="e.g., Ghi chú quan trọng"
            onChange={(e) => onUpdate({ ...item, cardHeader: e.target.value })}
          />
          <small className="text-xs text-gray-500 mt-1 block">
            Title will appear with underlines and language indicator
          </small>
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
                className={`flex-1 py-1 text-xs capitalize ${item.textAlign === align || (!item.textAlign && align === 'left') ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
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
              value={item.marginTop?.replace('mm', '') || '0.5'}
              placeholder="0.5"
              onChange={(e) => onUpdate({ ...item, marginTop: e.target.value + 'mm' })}
            />
          </div>
          <div>
            <label className="prop-label">Bottom Margin (mm)</label>
            <input
              type="text"
              className="prop-input"
              value={item.marginBottom?.replace('mm', '') || '0.5'}
              placeholder="0.5"
              onChange={(e) => onUpdate({ ...item, marginBottom: e.target.value + 'mm' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
