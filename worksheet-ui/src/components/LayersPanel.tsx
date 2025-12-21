import type { WorksheetItem } from '../types/worksheet';

import { useState, useEffect, useRef } from 'react';

interface LayersPanelProps {
  items: WorksheetItem[];
  selectedItem: WorksheetItem | null;
  onSelectItem: (item: WorksheetItem) => void;
  onReorderItems: (newItems: WorksheetItem[]) => void;
  onUpdate: (item: WorksheetItem) => void;
}

const TYPE_ICONS: Record<string, string> = {
  HEADER: 'H',
  TEXT: 'T',
  GRID: 'G',
  VOCAB: 'V',
  MULTIPLE_CHOICE: 'M',
  TRUE_FALSE: 'B',
  MATCHING: 'X',
  CLOZE: 'F',
};

const TYPE_LABELS: Record<string, string> = {
  HEADER: 'Header',
  TEXT: 'Text',
  GRID: 'Grid',
  VOCAB: 'Vocabulary',
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  MATCHING: 'Matching',
  CLOZE: 'Fill in Blank',
};

export function LayersPanel({ items, selectedItem, onSelectItem, onReorderItems, onUpdate }: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex) return;

    const newItems = [...items];
    const [moved] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    onReorderItems(newItems);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startEditing = (item: WorksheetItem) => {
    setEditingId(item.id);
    setEditValue(item.customLabel || TYPE_LABELS[item.type] || item.type);
  }

  const saveEdit = () => {
    if (editingId) {
      const item = items.find(i => i.id === editingId);
      if (item) {
        onUpdate({ ...item, customLabel: editValue });
      }
      setEditingId(null);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingId(null);
  }

  // Focus input on edit start
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  return (
    <div className="p-2.5 border-b border-gray-200">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Layers</h4>
      <ul className="list-none p-0 m-0">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`p-2 mb-1.5 bg-white border border-gray-300 rounded-md cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedItem?.id === item.id ? 'border-primary-blue bg-selected-bg ring-1 ring-primary-blue' : ''}`}
            onClick={() => onSelectItem(item)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            onDoubleClick={() => startEditing(item)}
            data-testid="layer-item"
            data-type={item.type}
          >
            <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center font-bold text-[10px] mr-2 shrink-0 select-none">
              {TYPE_ICONS[item.type] || '?'}
            </span>

            {editingId === item.id ? (
              <input
                ref={editInputRef}
                className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 outline-none"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex-1 flex justify-between items-center min-w-0">
                <span className="text-xs truncate select-none" title="Double-click to rename">
                  {item.customLabel || `${TYPE_LABELS[item.type] || item.type} ${index + 1}`}
                </span>
                <button
                  className="opacity-0 hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(item);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
