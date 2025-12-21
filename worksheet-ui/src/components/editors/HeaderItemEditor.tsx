import type { HeaderItem } from "../../types/worksheet";

interface HeaderItemEditorProps {
  item: HeaderItem;
  onUpdate: (item: HeaderItem) => void;
}

export function HeaderItemEditor({ item, onUpdate }: HeaderItemEditorProps) {

  return (
    <div className="space-y-4">
      <div className="prop-group">
        <h4>Header Elements</h4>
        <div className="flex flex-col gap-2">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={item.showName}
              onChange={(e) => onUpdate({ ...item, showName: e.target.checked })}
            />
            Show Name Field
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={item.showDate}
              onChange={(e) => onUpdate({ ...item, showDate: e.target.checked })}
            />
            Show Date Field
          </label>
        </div>
      </div>

      <div className="prop-group">
        <h4>Title Styling</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="prop-label">Font Size</label>
            <select 
              className="prop-select"
              value={item.fontSize || '18pt'}
              onChange={(e) => onUpdate({ ...item, fontSize: e.target.value })}
            >
              <option value="14pt">14pt</option>
              <option value="16pt">16pt</option>
              <option value="18pt">18pt</option>
              <option value="20pt">20pt</option>
              <option value="24pt">24pt</option>
            </select>
          </div>
          <div>
            <label className="prop-label">Font Weight</label>
            <select 
              className="prop-select"
              value={item.fontWeight || 'bold'}
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
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                className={`flex-1 py-1 text-xs capitalize ${item.textAlign === align || (!item.textAlign && align === 'center') ? 'bg-primary-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                onClick={() => onUpdate({ ...item, textAlign: align })}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
