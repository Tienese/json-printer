import type { GridItem } from "../../types/worksheet";

interface GridItemEditorProps {
  item: GridItem;
  onUpdate: (item: GridItem) => void;
}

export function GridItemEditor({ item, onUpdate }: GridItemEditorProps) {

  const getBoxSizeValue = (size: string) => parseInt(size) || 10;
  const boxSizeVal = getBoxSizeValue(item.boxSize);

  // A4 Page Width (210mm) - Margins (30mm) = 180mm Usable
  const maxColumns = Math.floor(180 / boxSizeVal);

  return (
    <div className="prop-group">
      <h4>Grid Properties</h4>

      <label className="checkbox-label mb-4">
        <input
          type="checkbox"
          checked={item.showPromptNumber || false}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
        />
        Show Question Number
      </label>

      <label className="checkbox-label mb-2">
        <input
          type="checkbox"
          checked={item.showFurigana}
          onChange={(e) => onUpdate({ ...item, showFurigana: e.target.checked })}
        />
        Show Furigana Row
      </label>

      <label className="checkbox-label mb-4">
        <input
          type="checkbox"
          checked={item.showGuides}
          onChange={(e) => onUpdate({ ...item, showGuides: e.target.checked })}
        />
        Show Inner Guides
      </label>

      <label className="checkbox-label mb-4">
        <input
          type="checkbox"
          checked={item.hideBorderOnContent || false}
          onChange={(e) => onUpdate({ ...item, hideBorderOnContent: e.target.checked })}
        />
        Hide Border on Filled Boxes
      </label>

      <label className="prop-label">Box Size</label>
      <select
        className="prop-input mb-4"
        value={item.boxSize}
        onChange={(e) => {
          const newSize = e.target.value as any;
          onUpdate({ ...item, boxSize: newSize });
        }}
      >
        <option value="8mm">Small (8mm)</option>
        <option value="10mm">Medium (10mm)</option>
        <option value="12mm">Large (12mm)</option>
      </select>

      <label className="prop-label">Alignment</label>
      <div className="flex border border-gray-300 rounded overflow-hidden mb-4">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            className={`flex-1 py-1 text-xs capitalize ${(item.alignment || 'left') === align ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
            onClick={() => onUpdate({ ...item, alignment: align })}
          >
            {align}
          </button>
        ))}
      </div>

      {item.showFurigana && (
        <>
          <label className="prop-label">Furigana Font Size</label>
          <select
            className="prop-input mb-4"
            value={item.furiganaFontSize || '6pt'}
            onChange={(e) => onUpdate({ ...item, furiganaFontSize: e.target.value })}
          >
            <option value="5pt">5pt (Tiny)</option>
            <option value="6pt">6pt (Small)</option>
            <option value="7pt">7pt (Medium)</option>
            <option value="8pt">8pt (Large)</option>
          </select>
        </>
      )}

      <div className="prop-group">
        <h5 className="text-[12px] font-semibold mt-6 mb-2">Sections & Columns</h5>

        <button
          className="btn-add mb-3"
          onClick={() => {
            const lastSection = item.sections[item.sections.length - 1];
            const colCount = lastSection ? lastSection.boxes.length : 15;
            const newSection = {
              id: crypto.randomUUID(),
              boxes: Array.from({ length: colCount }, () => ({ char: '', furigana: '' }))
            };
            onUpdate({
              ...item,
              sections: [...item.sections, newSection],
              rows: item.sections.length + 1
            });
          }}
        >
          + Add New Row
        </button>

        <div className="space-y-3">
          {item.sections.map((section, sIndex) => (
            <div key={section.id || sIndex} className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Row {sIndex + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 px-2 bg-red-50 text-red-600 border border-red-200 rounded text-[10px]"
                    onClick={() => {
                      if (item.sections.length <= 1) return;
                      const newSections = item.sections.filter((_, i) => i !== sIndex);
                      onUpdate({ ...item, sections: newSections, rows: newSections.length });
                    }}
                    disabled={item.sections.length <= 1}
                  >
                    Remove Row
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] text-gray-600">Boxes:</label>
                <div className="flex items-center gap-1">
                  <button
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-100"
                    onClick={() => {
                      const newSections = [...item.sections];
                      if (newSections[sIndex].boxes.length <= 1) return;
                      newSections[sIndex] = {
                        ...newSections[sIndex],
                        boxes: newSections[sIndex].boxes.slice(0, -1)
                      };
                      onUpdate({ ...item, sections: newSections });
                    }}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono">{section.boxes.length}</span>
                  <button
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-100"
                    onClick={() => {
                      const newSections = [...item.sections];
                      if (newSections[sIndex].boxes.length >= maxColumns) return;
                      newSections[sIndex] = {
                        ...newSections[sIndex],
                        boxes: [...newSections[sIndex].boxes, { char: '', furigana: '' }]
                      };
                      onUpdate({ ...item, sections: newSections });
                    }}
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 ml-auto">(Max: {maxColumns})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 italic mt-2">
        Note: Changing dimensions will preserve existing content where possible.
      </div>
    </div>
  );
}