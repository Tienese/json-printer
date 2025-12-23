import { useState, useEffect } from "react";
import type { SidebarProps } from "../types/sidebarTypes";
import { GridItemEditor } from "./editors/GridItemEditor";
import { HeaderItemEditor } from "./editors/HeaderItemEditor";
import { CardItemEditor } from "./editors/CardItemEditor";
import { VocabItemEditor } from "./editors/VocabItemEditor";
import { MultipleChoiceEditor } from "./editors/question-editors/MultipleChoiceEditor";
import { TrueFalseEditor } from "./editors/question-editors/TrueFalseEditor";
import { MatchingEditor } from "./editors/question-editors/MatchingEditor";
import { ClozeEditor } from "./editors/question-editors/ClozeEditor";

import { LayersPanel } from "./LayersPanel";
import { VocabCoachPanel } from "./VocabCoachPanel";
import { formatTimeAgo, formatFullDateTime } from "../utils/dateUtils";
import type { HistoryEntry } from "../hooks/useAutoSave";
import type { WorksheetTemplate } from "../types/worksheet";

type TabType = 'layers' | 'properties' | 'timeline' | 'vocab';

interface ExtendedSidebarProps extends SidebarProps {
  // Timeline props
  history?: HistoryEntry[];
  onPreviewHistory?: (template: WorksheetTemplate) => void;
  onRenameHistory?: (timestamp: string, newLabel: string) => void;
  // Vocab props
  worksheetId?: number | null;
  worksheetJson?: string;
}

export function Sidebar({
  itemsState,
  metadataState,
  pageState,
  onAddVocabTerm,
  onAddTFQuestion,
  isOpen,
  onToggle,
  history = [],
  onPreviewHistory,
  onRenameHistory,
  worksheetId = null,
  worksheetJson = '',
}: ExtendedSidebarProps) {
  const { items, selectedItem, onSelectItem, onUpdate, onDelete, onReorderItems } = itemsState;
  const { metadata, onUpdateMetadata } = metadataState;
  const { currentPageIndex, totalPages, onPrevPage, onNextPage, onAddPage, onDeletePage } = pageState;
  const [activeTab, setActiveTab] = useState<TabType>('layers');
  const [editingTimestamp, setEditingTimestamp] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Auto-switch to properties when item selected
  useEffect(() => {
    if (selectedItem) {
      setActiveTab('properties');
    }
  }, [selectedItem]);

  const renderEditor = () => {
    if (!selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-5 text-center">
          <p>Select an item from the worksheet or layers to edit its properties.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {(() => {
          switch (selectedItem.type) {
            case 'HEADER':
              return <HeaderItemEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'GRID':
              return <GridItemEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'CARD':
              return <CardItemEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'VOCAB':
              return <VocabItemEditor item={selectedItem as any} onUpdate={onUpdate} onAddTerm={onAddVocabTerm} />;
            case 'MULTIPLE_CHOICE':
              return <MultipleChoiceEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'TRUE_FALSE':
              return <TrueFalseEditor item={selectedItem as any} onUpdate={onUpdate} onAddQuestion={onAddTFQuestion} />;
            case 'MATCHING':
              return <MatchingEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'CLOZE':
              return <ClozeEditor item={selectedItem} onUpdate={onUpdate} />;
            default:
              return <p>No editor for this item type.</p>;
          }
        })()}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onDelete(selectedItem)}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm font-medium"
          >
            Delete Item
          </button>
        </div>
      </div>
    );
  };

  const handleStartEdit = (entry: HistoryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTimestamp(entry.id || entry.timestamp);
    setEditValue(entry.label || `Snapshot ${history.length - history.indexOf(entry)}`);
  };

  const handleSaveEdit = () => {
    if (editingTimestamp && onRenameHistory) {
      onRenameHistory(editingTimestamp, editValue);
      setEditingTimestamp(null);
    }
  };

  const tabs = [
    { id: 'layers' as TabType, label: 'Outline', icon: '☰' },
    { id: 'properties' as TabType, label: 'Props', icon: '⚙' },
    { id: 'timeline' as TabType, label: 'History', icon: '📜' },
    { id: 'vocab' as TabType, label: 'Coach', icon: '📊' },
  ];

  return (
    <div className={`shrink-0 bg-sidebar-bg border-l border-gray-200 flex flex-col h-full relative transition-all duration-300 print:hidden ${isOpen ? 'w-[300px]' : 'w-[40px] items-center'}`}>
      {/* Sidebar Title Bar / Collapse Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 h-[45px] w-full">
        {isOpen && <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sidebar</h2>}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Tabs Navigation - 4 tabs */}
          <div className="flex border-b border-gray-200 w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.id
                  ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.icon}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto w-full">
            {/* LAYERS TAB */}
            {activeTab === 'layers' && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-1">
                {/* Worksheet Title */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Worksheet Title</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={metadata.title}
                    onChange={(e) => onUpdateMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Untitled Worksheet"
                  />
                </div>

                {/* Page Navigation */}
                <div className="p-3 border-b border-gray-100 bg-white">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pages</label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={onPrevPage}
                        disabled={currentPageIndex === 0}
                        className="p-1.5 rounded border border-gray-200 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title="Previous Page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                      </button>
                      <span className="text-sm font-medium text-gray-700 px-3 min-w-[60px] text-center">
                        {currentPageIndex + 1} / {totalPages}
                      </span>
                      <button
                        onClick={onNextPage}
                        disabled={currentPageIndex >= totalPages - 1}
                        className="p-1.5 rounded border border-gray-200 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title="Next Page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={onAddPage}
                        className="p-1.5 rounded border border-gray-200 text-green-600"
                        title="Add Page"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                      </button>
                      {totalPages > 1 && (
                        <button
                          onClick={() => confirm(`Delete Page ${currentPageIndex + 1}?`) && onDeletePage()}
                          className="p-1.5 rounded border border-gray-200 text-red-500"
                          title="Delete Page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <LayersPanel
                  items={items}
                  selectedItem={selectedItem}
                  onSelectItem={onSelectItem}
                  onReorderItems={onReorderItems}
                  onUpdate={onUpdate}
                />
              </div>
            )}

            {/* PROPERTIES TAB */}
            {activeTab === 'properties' && (
              <div className="p-4 animate-in fade-in slide-in-from-right-1">
                {renderEditor()}
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="p-2 animate-in fade-in">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="text-3xl mb-2 block">📜</span>
                    <p className="text-sm">No history yet</p>
                    <p className="text-xs mt-1">Snapshots will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry, idx) => (
                      <div
                        key={entry.id || entry.timestamp}
                        className="group relative p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        onClick={() => onPreviewHistory?.(entry.template)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${entry.type === 'manual'
                            ? 'bg-blue-500 ring-2 ring-blue-100'
                            : idx === 0
                              ? 'bg-green-500 ring-2 ring-green-100'
                              : 'bg-gray-300'
                            }`} />

                          <div className="flex-1 min-w-0">
                            {editingTimestamp === (entry.id || entry.timestamp) ? (
                              <input
                                autoFocus
                                className="w-full text-xs border rounded px-1 py-0.5 outline-none focus:border-blue-500"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') setEditingTimestamp(null);
                                }}
                                onBlur={handleSaveEdit}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <span className={`text-xs font-medium block ${entry.type === 'manual' ? 'text-blue-700' : 'text-gray-700'}`}>
                                  {entry.label || (entry.type === 'manual' ? 'Snapshot' : 'Auto-save')}
                                </span>
                                <span className="text-[10px] text-gray-400" title={formatFullDateTime(entry.timestamp)}>
                                  {formatTimeAgo(entry.timestamp)}
                                </span>
                              </>
                            )}
                          </div>

                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-opacity"
                            onClick={(e) => handleStartEdit(entry, e)}
                            title="Rename"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VOCAB COACH TAB */}
            {activeTab === 'vocab' && (
              <div className="animate-in fade-in">
                <VocabCoachPanel worksheetId={worksheetId} worksheetJson={worksheetJson} />
              </div>
            )}
          </div>
        </>
      )}

      {!isOpen && (
        <div className="flex flex-col items-center py-4 gap-4">
          <div className={`w-2 h-2 rounded-full ${selectedItem ? 'bg-blue-500' : 'bg-gray-300'}`} title={selectedItem ? "Item Selected" : "No Selection"} />
        </div>
      )}
    </div>
  );
}
