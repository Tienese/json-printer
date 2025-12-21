import type { TextItem } from "../../types/worksheet";

interface TextItemEditorProps {
  item: TextItem;
  onUpdate: (item: TextItem) => void;
}

export function TextItemEditor({ item, onUpdate }: TextItemEditorProps) {
  return (
    <div className="space-y-4">
      <div className="prop-group">
        <h4>Text Styling</h4>

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
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="prop-label">Font Size</label>
            <select 
              className="prop-select"
              value={item.fontSize || '12pt'}
              onChange={(e) => onUpdate({ ...item, fontSize: e.target.value })}
            >
              <option value="8pt">8pt</option>
              <option value="9pt">9pt</option>
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

        <div className="mt-2">
          <label className="prop-label">Alignment</label>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            {(['left', 'center', 'right', 'justify'] as const).map((align) => (
              <button
                key={align}
                className={`flex-1 py-1 text-xs capitalize ${item.textAlign === align || (!item.textAlign && align === 'left') ? 'bg-primary-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => onUpdate({ ...item, textAlign: align })}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="prop-group">
        <h4>Spacing (mm)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="prop-label">Top Margin</label>
            <input
              type="text"
              className="prop-input"
              value={item.marginTop || '0.5'}
              placeholder="0.5"
              onChange={(e) => onUpdate({ ...item, marginTop: e.target.value + 'mm' })}
            />
          </div>
          <div>
            <label className="prop-label">Bottom Margin</label>
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
