import { useState } from 'react';
import type { VocabItem } from "../../types/worksheet";
import { aiLog } from '../../utils/aiLogger';

interface VocabItemEditorProps {
  item: VocabItem;
  onUpdate: (item: VocabItem) => void;
  onAddTerm: (itemId: string, term: any) => void;
}

export function VocabItemEditor({ item, onUpdate, onAddTerm }: VocabItemEditorProps) {
  const addTerm = () => {
    onAddTerm(item.id, { id: crypto.randomUUID(), term: 'New Term', meaning: '' });
  };

  const removeTerm = (index: number) => {
    const newTerms = [...item.terms];
    newTerms.splice(index, 1);
    onUpdate({ ...item, terms: newTerms });
  };

  const handleColumnChange = (newColumns: number) => {
    onUpdate({ ...item, columns: newColumns });
  };

  const handleFontSizeChange = (newSize: number) => {
    onUpdate({ ...item, fontSize: newSize });
  };

  // Tab state
  const [activeTab, setActiveTab] = useState<'term' | 'grid'>('term');

  const handleTabChange = (tab: 'term' | 'grid') => {
    setActiveTab(tab);
    aiLog.action('VocabItemEditor', 'TAB_SWITCH', { tab, termCount: item.terms.length });
  };

  return (
    <div className="prop-group">
      <h4>Vocabulary Properties</h4>

      <label className="checkbox-label mb-4">
        <input
          type="checkbox"
          checked={item.showPromptNumber || false}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
        />
        Show Question Number
      </label>

      {/* Tab System */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          className={`px-3 py-1 text-xs font-bold border-2 border-black ${activeTab === 'term' ? 'bg-black text-white' : 'theme-surface theme-text'
            }`}
          onClick={() => handleTabChange('term')}
        >
          Term
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-xs font-bold border-2 border-black ${activeTab === 'grid' ? 'bg-black text-white' : 'theme-surface theme-text'
            }`}
          onClick={() => handleTabChange('grid')}
        >
          Grid
        </button>
      </div>

      {/* Config Box */}
      <div className="min-h-[140px] border-2 theme-border p-3 mb-4 theme-elevated">
        {activeTab === 'term' ? (
          // Term Config
          <>
            <label className="prop-label">Columns</label>
            <select
              className="prop-select"
              value={item.columns}
              onChange={(e) => handleColumnChange(parseInt(e.target.value, 10))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>

            <label className="prop-label">Global List Style</label>
            <select
              className="prop-select mb-4"
              value={item.listStyle || 'number'}
              onChange={(e) => onUpdate({ ...item, listStyle: e.target.value as any })}
            >
              <option value="number">1. 2. 3. (Numbers)</option>
              <option value="letter">a. b. c. (Letters)</option>
              <option value="roman">I. II. III. (Roman)</option>
              <option value="bullet">• (Bullets)</option>
              <option value="none">None (Indented)</option>
              <option value="vd">Vd. (Example)</option>
              <option value="example">例. (Example)</option>
            </select>

            <label className="prop-label">Font Size: {item.fontSize}pt</label>
            <input
              type="range"
              min="10"
              max="16"
              className="w-full h-2 theme-elevated rounded-lg appearance-none cursor-pointer"
              value={item.fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
            />
          </>
        ) : (
          // Grid Config
          <>
            <label className="prop-label">Box Size</label>
            <select
              className="prop-select"
              value={item.gridBoxSize || '10mm'}
              onChange={(e) => onUpdate({ ...item, gridBoxSize: e.target.value as any })}
            >
              <option value="8mm">Small (8mm)</option>
              <option value="10mm">Medium (10mm)</option>
              <option value="12mm">Large (12mm)</option>
            </select>

            <label className="prop-label">Layout</label>
            <select
              className="prop-select"
              value={item.gridLayout || 'inline'}
              onChange={(e) => onUpdate({ ...item, gridLayout: e.target.value as any })}
            >
              <option value="inline">Inline</option>
              <option value="below">Below</option>
            </select>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={item.gridShowFurigana || false}
                onChange={(e) => onUpdate({ ...item, gridShowFurigana: e.target.checked })}
              />
              Show Furigana
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={item.gridShowGuides || false}
                onChange={(e) => onUpdate({ ...item, gridShowGuides: e.target.checked })}
              />
              Show Guides
            </label>
          </>
        )}
      </div>

      <button className="btn-add mb-4" onClick={addTerm}>+ Add Term</button>

      <h5 className="text-[12px] font-semibold mt-4 mb-2">Manage Terms ({item.terms.length})</h5>
      <div className="space-y-1.5">
        {item.terms.map((term, index) => (
          <div key={term.id || index} className="flex flex-col p-1.5 theme-elevated rounded border theme-border gap-2">
            <div className="flex items-center gap-1.5 ">
              <span className="flex-1 text-xs text-gray-700 truncate font-bold" title={term.term}>
                {index + 1}. {term.term || <span className="italic text-gray-400 font-normal">Empty</span>}
              </span>
              <button
                className="btn-remove"
                onClick={() => removeTerm(index)}
                title="Remove term"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-500 shrink-0">Type:</span>
                <select
                  className="text-[9px] py-0 px-1 border rounded theme-surface theme-text h-5"
                  value={term.termType || 'text'}
                  onChange={(e) => {
                    const newTerms = [...item.terms];
                    newTerms[index] = { ...newTerms[index], termType: e.target.value as 'text' | 'grid' };
                    onUpdate({ ...item, terms: newTerms });
                  }}
                >
                  <option value="text">Text</option>
                  <option value="grid">Grid</option>
                </select>
              </div>

              {term.termType === 'grid' && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-500 shrink-0">Boxes:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="text-[9px] py-0 px-1 border rounded theme-surface theme-text h-5 w-12"
                    value={term.gridBoxCount || 5}
                    onChange={(e) => {
                      const newTerms = [...item.terms];
                      newTerms[index] = { ...newTerms[index], gridBoxCount: parseInt(e.target.value) || 5 };
                      onUpdate({ ...item, terms: newTerms });
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="h-3 w-3"
                  checked={term.showTerm !== false}
                  onChange={(e) => {
                    const newTerms = [...item.terms];
                    newTerms[index] = { ...newTerms[index], showTerm: e.target.checked };
                    onUpdate({ ...item, terms: newTerms });
                  }}
                />
                <span className="text-[9px] text-gray-500">Term</span>
              </div>

              {term.termType !== 'grid' && (
                <div className="flex items-center gap-1">
                  <select
                    className="text-[9px] py-0 px-1 border rounded theme-surface theme-text h-5"
                    value={term.termLayout || 'inline'}
                    onChange={(e) => {
                      const newTerms = [...item.terms];
                      newTerms[index] = { ...newTerms[index], termLayout: e.target.value as 'inline' | 'below' };
                      onUpdate({ ...item, terms: newTerms });
                    }}
                  >
                    <option value="inline">Inline</option>
                    <option value="below">Below</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="h-3 w-3"
                  checked={term.showTrailingLine !== false}
                  onChange={(e) => {
                    const newTerms = [...item.terms];
                    newTerms[index] = { ...newTerms[index], showTrailingLine: e.target.checked };
                    onUpdate({ ...item, terms: newTerms });
                  }}
                />
                <span className="text-[9px] text-gray-500">Line</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
