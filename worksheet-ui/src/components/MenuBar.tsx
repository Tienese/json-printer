import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud, FileDown, FileUp, Camera, History,
  User, GraduationCap,
  Plus, Type, Grid3X3, BookOpen, ListTodo, CheckSquare, ArrowLeftRight, MoreHorizontal,
  ChevronDown, Check
} from 'lucide-react';
import type { WorksheetTemplate, ViewMode } from '../types/worksheet';
import type { HistoryEntry } from '../hooks/useAutoSave';

interface MenuBarProps {
  // Save menu
  onSaveToCloud: () => void;
  onSaveToFile: () => void;
  onLoadFromFile: () => void;
  onSnapshot: () => void;
  history: HistoryEntry[];
  onPreviewHistory: (template: WorksheetTemplate) => void;

  // View menu
  mode: ViewMode;
  onToggleMode: () => void;

  // Insert menu
  onAddItem: (type: string) => void;

  isSaving: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onSaveToCloud,
  onSaveToFile,
  onLoadFromFile,
  onSnapshot,
  history,
  onPreviewHistory,
  mode,
  onToggleMode,
  onAddItem,
  isSaving
}) => {
  const [openMenu, setOpenMenu] = useState<'save' | 'view' | 'insert' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu: 'save' | 'view' | 'insert') => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenu = () => setOpenMenu(null);

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  const handleAddItem = (type: string) => {
    onAddItem(type);
    closeMenu();
  };

  const handleToggleMode = (newMode: ViewMode) => {
    if (mode !== newMode) {
      onToggleMode();
    }
    closeMenu();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 select-none shadow-sm h-12 relative z-50" ref={menuRef}>
      {/* Back Button Placeholder - Handled by Parent or layout, but consistent spacing is nice */}

      {/* Save Menu */}
      <div className="relative">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors
            ${openMenu === 'save' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => toggleMenu('save')}
        >
          <Cloud size={18} className={isSaving ? "animate-pulse" : ""} />
          <span>Save</span>
          <ChevronDown size={14} />
        </button>

        {openMenu === 'save' && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sync & Storage
            </div>

            <button onClick={() => handleAction(onSaveToCloud)} disabled={isSaving} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 disabled:opacity-50">
              <Cloud size={16} className="text-blue-500" />
              <span>{isSaving ? 'Saving...' : 'Save to Cloud'}</span>
            </button>

            <button onClick={() => handleAction(onSaveToFile)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <FileDown size={16} className="text-gray-500" />
              <span>Download JSON</span>
            </button>

            <button onClick={() => handleAction(onLoadFromFile)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <FileUp size={16} className="text-gray-500" />
              <span>Load from File</span>
            </button>

            <div className="my-1 border-t border-gray-100"></div>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              History
            </div>

            <button onClick={() => handleAction(onSnapshot)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <Camera size={16} className="text-purple-500" />
              <span>Create Snapshot</span>
            </button>

            <div className="max-h-60 overflow-y-auto">
              {history.slice(0, 5).map(entry => (
                <button
                  key={entry.id || entry.timestamp}
                  onClick={() => handleAction(() => onPreviewHistory(entry.template))}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-600 group"
                >
                  <History size={14} className="text-gray-400 group-hover:text-gray-600" />
                  <div className="flex-1 truncate">
                    <span className="block truncate">{entry.label || 'Autosave'}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))}
              {history.length > 5 && (
                <div className="px-4 py-2 text-xs text-center text-gray-400 italic">
                  + {history.length - 5} more in Timeline tab
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors
            ${openMenu === 'view' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => toggleMenu('view')}
        >
          {mode === 'teacher' ? <GraduationCap size={18} /> : <User size={18} />}
          <span>View</span>
          <ChevronDown size={14} />
        </button>

        {openMenu === 'view' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => handleToggleMode('teacher')}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm
                ${mode === 'teacher' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
            >
              <GraduationCap size={16} />
              <span className="flex-1">Teacher Mode</span>
              {mode === 'teacher' && <Check size={14} />}
            </button>

            <button
              onClick={() => handleToggleMode('student')}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm
                ${mode === 'student' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
            >
              <User size={16} />
              <span className="flex-1">Student Mode</span>
              {mode === 'student' && <Check size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Insert Menu */}
      <div className="relative">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors
            ${openMenu === 'insert' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
          onClick={() => toggleMenu('insert')}
        >
          <Plus size={18} />
          <span>Insert</span>
          <ChevronDown size={14} />
        </button>

        {openMenu === 'insert' && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Basic Elements
            </div>

            <button onClick={() => handleAddItem('CARD')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <Type size={16} className="text-gray-500" />
              <span>Text Card</span>
            </button>

            <button onClick={() => handleAddItem('GRID')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <Grid3X3 size={16} className="text-gray-500" />
              <span>Writing Grid</span>
            </button>

            <button onClick={() => handleAddItem('VOCAB')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <BookOpen size={16} className="text-gray-500" />
              <span>Vocabulary</span>
            </button>

            <div className="my-1 border-t border-gray-100"></div>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Questions
            </div>

            <button onClick={() => handleAddItem('MULTIPLE_CHOICE')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <ListTodo size={16} className="text-gray-500" />
              <span>Multiple Choice</span>
            </button>

            <button onClick={() => handleAddItem('TRUE_FALSE')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <CheckSquare size={16} className="text-gray-500" />
              <span>True / False</span>
            </button>

            <button onClick={() => handleAddItem('MATCHING')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <ArrowLeftRight size={16} className="text-gray-500" />
              <span>Matching</span>
            </button>

            <button onClick={() => handleAddItem('CLOZE')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
              <MoreHorizontal size={16} className="text-gray-500" />
              <span>Cloze / Fill-in</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
