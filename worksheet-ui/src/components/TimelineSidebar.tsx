import { useState } from 'react';
import type { HistoryEntry } from '../hooks/useAutoSave';
import { formatTimeAgo, formatFullDateTime } from '../utils/dateUtils';
import type { WorksheetTemplate } from '../types/worksheet';

interface TimelineSidebarProps {
    history: HistoryEntry[];
    onPreview: (template: WorksheetTemplate) => void;
    onRename: (timestamp: string, newLabel: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function TimelineSidebar({ history, onPreview, onRename, isOpen, onToggle }: TimelineSidebarProps) {
    const [editingTimestamp, setEditingTimestamp] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleStartEdit = (entry: HistoryEntry, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTimestamp(entry.id || entry.timestamp);
        setEditValue(entry.label || `Snapshot ${history.length - history.indexOf(entry)}`); // Default proposal
    };

    const handleSaveEdit = () => {
        if (editingTimestamp) {
            onRename(editingTimestamp, editValue);
            setEditingTimestamp(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveEdit();
        if (e.key === 'Escape') setEditingTimestamp(null);
    };

    return (
        <div className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${isOpen ? 'w-[250px]' : 'w-[40px] items-center'} print:hidden`}>
            <div className="flex items-center justify-between p-3 border-b border-gray-200 h-[45px]">
                {isOpen && <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timeline</h2>}
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                    title={isOpen ? "Collapse Timeline" : "Expand Timeline"}
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 12l12 6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    )}
                </button>
            </div>

            {isOpen ? (
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-xs italic">No history yet</p>
                        </div>
                    ) : (
                        history.map((entry, idx) => (
                            <div
                                key={entry.id || entry.timestamp}
                                className="group relative p-2 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                onClick={() => onPreview(entry.template)}
                            >
                                {/* Timeline Connector Line */}
                                {idx < history.length - 1 && (
                                    <div className="absolute left-[11px] top-[24px] bottom-[-10px] w-px bg-gray-200 group-hover:bg-blue-200 z-0"></div>
                                )}

                                <div className="flex items-start gap-3 relative z-10">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${entry.type === 'manual'
                                        ? 'bg-blue-500 ring-2 ring-blue-100' // Manual = Blue
                                        : idx === 0
                                            ? 'bg-green-500 ring-2 ring-green-100' // Latest Auto = Green
                                            : 'bg-gray-300 group-hover:bg-blue-300' // Old Auto = Gray
                                        }`}></div>

                                    <div className="flex-1 min-w-0">
                                        {editingTimestamp === (entry.id || entry.timestamp) ? (
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <input
                                                    autoFocus
                                                    className="w-full text-xs border rounded px-1 py-0.5 outline-none focus:border-blue-500"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    onBlur={handleSaveEdit}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-start group/item">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-medium truncate pr-4 ${entry.type === 'manual' ? 'text-blue-700' : 'text-gray-700'}`} title={entry.label || (entry.type === 'manual' ? 'Snapshot' : `Auto-Save`)}>
                                                        {entry.label || (entry.type === 'manual' ? 'Snapshot' : `Auto-Save`)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400" title={formatFullDateTime(entry.timestamp)}>
                                                        {formatTimeAgo(entry.timestamp)}
                                                    </span>
                                                </div>

                                                <button
                                                    className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-opacity absolute right-0 top-0"
                                                    onClick={(e) => handleStartEdit(entry, e)}
                                                    title="Rename"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center py-4 gap-4">
                    {/* Collapsed View icons */}
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Timeline Active"></div>
                    {history.slice(0, 5).map((entry, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" title={formatFullDateTime(entry.timestamp)}></div>
                    ))}
                </div>
            )}
        </div>
    );
}
