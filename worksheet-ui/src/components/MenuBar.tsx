import { useState, useRef, useEffect } from 'react';
import type { HistoryEntry } from '../hooks/useAutoSave';
import type { WorksheetTemplate, ViewMode } from '../types/worksheet';
import { formatTimeAgo } from '../utils/dateUtils';

interface MenuBarProps {
    // Save menu
    onSaveToCloud: () => void;
    onSaveToFile: () => void;
    onLoadFromFile: () => void;
    onSnapshot: () => void;
    history: HistoryEntry[];
    onPreviewHistory: (template: WorksheetTemplate) => void;
    isSaving: boolean;

    // View menu
    mode: ViewMode;
    onToggleMode: () => void;

    // Insert menu
    onAddItem: (type: string) => void;

    // Navigation
    onNavigate?: (route: string) => void;
}

type MenuType = 'save' | 'view' | 'insert' | null;

export function MenuBar({
    onSaveToCloud,
    onSaveToFile,
    onLoadFromFile,
    onSnapshot,
    history,
    onPreviewHistory,
    isSaving,
    mode,
    onToggleMode,
    onAddItem,
    onNavigate,
}: MenuBarProps) {
    const [openMenu, setOpenMenu] = useState<MenuType>(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
                setShowTimeline(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (menu: MenuType) => {
        setOpenMenu(openMenu === menu ? null : menu);
        setShowTimeline(false);
    };

    const menuButtonClass = (menu: MenuType) =>
        `px-3 py-1.5 text-sm font-medium rounded ${openMenu === menu
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-700 hover:bg-gray-100'
        }`;

    const menuItemClass = "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3";

    return (
        <div ref={menuRef} className="flex items-center gap-1 print:hidden">
            {/* SAVE Menu */}
            <div className="relative">
                <button
                    className={menuButtonClass('save')}
                    onClick={() => toggleMenu('save')}
                >
                    Save ▾
                </button>
                {openMenu === 'save' && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] z-50">
                        <button className={menuItemClass} onClick={() => { onSaveToCloud(); setOpenMenu(null); }} disabled={isSaving}>
                            <span>☁</span>
                            {isSaving ? 'Saving...' : 'Save to Cloud'}
                        </button>
                        <button className={menuItemClass} onClick={() => { onSaveToFile(); setOpenMenu(null); }}>
                            <span>↓</span>
                            Download JSON
                        </button>
                        <button className={menuItemClass} onClick={() => { onLoadFromFile(); setOpenMenu(null); }}>
                            <span>↑</span>
                            Load from File
                        </button>

                        <div className="border-t border-gray-100 my-1" />

                        <button className={menuItemClass} onClick={() => { onSnapshot(); setOpenMenu(null); }}>
                            <span>📸</span>
                            Create Snapshot
                        </button>

                        <div className="border-t border-gray-100 my-1" />

                        {/* Timeline Submenu */}
                        <div className="relative">
                            <button
                                className={`${menuItemClass} justify-between`}
                                onClick={() => setShowTimeline(!showTimeline)}
                            >
                                <span className="flex items-center gap-3">
                                    <span>📜</span>
                                    Timeline
                                </span>
                                <span className="text-gray-400">▸</span>
                            </button>
                            {showTimeline && (
                                <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
                                    {history.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-gray-400 italic">No history yet</div>
                                    ) : (
                                        history.slice(0, 10).map((entry) => (
                                            <button
                                                key={entry.id || entry.timestamp}
                                                className={menuItemClass}
                                                onClick={() => {
                                                    onPreviewHistory(entry.template);
                                                    setOpenMenu(null);
                                                    setShowTimeline(false);
                                                }}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${entry.type === 'manual' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs truncate">{entry.label || (entry.type === 'manual' ? 'Snapshot' : 'Auto-save')}</div>
                                                    <div className="text-[10px] text-gray-400">{formatTimeAgo(entry.timestamp)}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* VIEW Menu */}
            <div className="relative">
                <button
                    className={menuButtonClass('view')}
                    onClick={() => toggleMenu('view')}
                >
                    View ▾
                </button>
                {openMenu === 'view' && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-50">
                        <button
                            className={menuItemClass}
                            onClick={() => { if (mode !== 'student') onToggleMode(); setOpenMenu(null); }}
                        >
                            <span className={`w-3 h-3 rounded-full border-2 ${mode === 'student' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                            Student View
                        </button>
                        <button
                            className={menuItemClass}
                            onClick={() => { if (mode !== 'teacher') onToggleMode(); setOpenMenu(null); }}
                        >
                            <span className={`w-3 h-3 rounded-full border-2 ${mode === 'teacher' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                            Teacher View
                        </button>
                    </div>
                )}
            </div>

            {/* INSERT Menu */}
            <div className="relative">
                <button
                    className={menuButtonClass('insert')}
                    onClick={() => toggleMenu('insert')}
                >
                    Insert ▾
                </button>
                {openMenu === 'insert' && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-50">
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Content</div>
                        {[
                            { label: 'Card Block', type: 'CARD', icon: '📝' },
                            { label: 'Writing Grid', type: 'GRID', icon: '🔲' },
                            { label: 'Vocabulary', type: 'VOCAB', icon: '📖' },
                        ].map(opt => (
                            <button
                                key={opt.type}
                                className={menuItemClass}
                                onClick={() => { onAddItem(opt.type); setOpenMenu(null); }}
                            >
                                <span>{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}

                        <div className="border-t border-gray-100 my-1" />
                        <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</div>

                        {[
                            { label: 'Multiple Choice', type: 'MULTIPLE_CHOICE', icon: '✓' },
                            { label: 'True / False', type: 'TRUE_FALSE', icon: '✓✗' },
                            { label: 'Matching', type: 'MATCHING', icon: '↔' },
                            { label: 'Cloze / Fill-in', type: 'CLOZE', icon: '___' },
                        ].map(opt => (
                            <button
                                key={opt.type}
                                className={menuItemClass}
                                onClick={() => { onAddItem(opt.type); setOpenMenu(null); }}
                            >
                                <span className="w-4 text-center text-xs">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Cog */}
            <button
                onClick={() => onNavigate?.('settings')}
                className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>
        </div>
    );
}
