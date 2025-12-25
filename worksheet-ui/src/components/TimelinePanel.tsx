import React, { useState } from 'react';
import type { WorksheetTemplate } from '../types/worksheet';
import type { HistoryEntry } from '../hooks/useAutoSave';
import { History, Camera, RotateCcw, Edit2, Check, X } from 'lucide-react';

interface TimelinePanelProps {
  history: HistoryEntry[];
  onSnapshot: () => void;
  onPreviewHistory: (template: WorksheetTemplate) => void;
  onRenameHistoryEntry: (id: string, newLabel: string) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  history,
  onSnapshot,
  onPreviewHistory,
  onRenameHistoryEntry
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const startEditing = (entry: HistoryEntry) => {
    setEditingId(entry.id || entry.timestamp);
    setEditLabel(entry.label || 'Snapshot');
  };

  const saveLabel = (entry: HistoryEntry) => {
    onRenameHistoryEntry(entry.id || entry.timestamp, editLabel);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-800">History & Snapshots</h3>
        </div>

        <button
          onClick={onSnapshot}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          <Camera size={16} />
          <span>Create Snapshot</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {history.length === 0 && (
          <div className="text-center text-gray-400 mt-8 text-sm">
            No history recorded yet.
          </div>
        )}

        {history.map((entry) => {
          const isEditing = editingId === (entry.id || entry.timestamp);
          const isManual = entry.type === 'manual' || !entry.type;

          return (
            <div
              key={entry.id || entry.timestamp}
              className={`p-3 rounded-lg border text-left group transition-colors ${
                isManual ? 'bg-white border-gray-200 hover:border-indigo-300' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1 mb-1">
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full text-sm border rounded px-1 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveLabel(entry);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <button onClick={() => saveLabel(entry)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14}/></button>
                      <button onClick={cancelEdit} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-medium text-sm truncate ${isManual ? 'text-gray-900' : 'text-gray-600'}`}>
                        {entry.label || (entry.type === 'auto' ? 'Autosave' : 'Snapshot')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(entry); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 p-0.5"
                        title="Rename"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 flex items-center gap-1">
                     <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                     <span>•</span>
                     <span>{entry.template.pages?.reduce((s, p) => s + p.items.length, 0) || 0} items</span>
                  </div>
                </div>

                <button
                  onClick={() => onPreviewHistory(entry.template)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Restore this version"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
