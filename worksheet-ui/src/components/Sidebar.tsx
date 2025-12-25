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
import { isVocabItem, isTrueFalseItem } from "../types/typeGuards";

import { LayersPanel } from "./LayersPanel";
import { TimelinePanel } from "./TimelinePanel";
import { VocabCoachPanel } from "./VocabCoachPanel";
import type { HistoryEntry } from "../hooks/useAutoSave";
import type { WorksheetTemplate } from "../types/worksheet";

type TabType = 'properties' | 'layers' | 'timeline' | 'vocab';

interface ExtendedSidebarProps extends SidebarProps {
  history: HistoryEntry[];
  onSnapshot: () => void;
  onPreviewHistory: (template: WorksheetTemplate) => void;
  onRenameHistoryEntry: (id: string, newLabel: string) => void;
  currentWorksheetId: number | null;
}

export function Sidebar({
  itemsState,
  metadataState,
  pageState,
  onAddVocabTerm,
  onAddTFQuestion,
  isOpen,
  onToggle,
  history,
  onSnapshot,
  onPreviewHistory,
  onRenameHistoryEntry,
  currentWorksheetId
}: ExtendedSidebarProps) {
  const { items, selectedItem, onSelectItem, onUpdate, onDelete, onReorderItems } = itemsState;
  const { metadata, onUpdateMetadata } = metadataState;
  const { currentPageIndex, totalPages, onPrevPage, onNextPage, onAddPage, onDeletePage } = pageState;
  const [activeTab, setActiveTab] = useState<TabType>('properties');

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
              if (isVocabItem(selectedItem)) {
                return <VocabItemEditor item={selectedItem} onUpdate={onUpdate} onAddTerm={onAddVocabTerm} />;
              }
              return null;
            case 'MULTIPLE_CHOICE':
              return <MultipleChoiceEditor item={selectedItem} onUpdate={onUpdate} />;
            case 'TRUE_FALSE':
              if (isTrueFalseItem(selectedItem)) {
                return <TrueFalseEditor item={selectedItem} onUpdate={onUpdate} onAddQuestion={onAddTFQuestion} />;
              }
              return null;
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
            className="w-full py-2 px-4 bg-red-600 text-white rounded text-sm font-medium"
          >
            Delete Item
          </button>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'properties' as TabType, label: 'Props', icon: '⚙' },
    { id: 'layers' as TabType, label: 'Layers', icon: '☰' },
    { id: 'timeline' as TabType, label: 'Timeline', icon: '⏱' },
    { id: 'vocab' as TabType, label: 'Vocab', icon: '📖' },
  ];

  return (
    <div className={`shrink-0 theme-surface border-l theme-border flex flex-col h-full relative print:hidden ${isOpen ? 'w-[300px]' : 'w-[40px] items-center'}`}>
      {/* Sidebar Title Bar / Collapse Toggle */}
      <div className="flex items-center justify-between p-3 border-b theme-border h-[45px] w-full">
        {isOpen && <h2 className="text-xs font-bold theme-text-muted uppercase tracking-wider">Sidebar</h2>}
        <button
          onClick={onToggle}
          className="p-1 rounded theme-text-secondary"
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
          {/* Tabs Navigation */}
          <div className="flex border-b theme-border w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1 ${activeTab === tab.id
                  ? 'theme-accent border-b-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'theme-text-secondary hover:bg-gray-50'
                  }`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto w-full">
            {/* PROPERTIES TAB */}
            {activeTab === 'properties' && (
              <div className="p-4 animate-in fade-in slide-in-from-right-1">
                {renderEditor()}
              </div>
            )}

            {/* LAYERS TAB */}
            {activeTab === 'layers' && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-1">
                {/* Worksheet Title */}
                <div className="p-4 border-b theme-border theme-elevated">
                  <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider mb-2 block">Worksheet Title</label>
                  <input
                    className="w-full border theme-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-accent)]/30 outline-none theme-surface theme-text"
                    value={metadata.title}
                    onChange={(e) => onUpdateMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Untitled Worksheet"
                  />
                </div>

                {/* Page Navigation */}
                <div className="p-3 border-b theme-border theme-surface">
                  <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider mb-2 block">Pages</label>
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

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <TimelinePanel
                history={history}
                onSnapshot={onSnapshot}
                onPreviewHistory={onPreviewHistory}
                onRenameHistoryEntry={onRenameHistoryEntry}
              />
            )}

            {/* VOCAB COACH TAB */}
            {activeTab === 'vocab' && (
              <VocabCoachPanel
                worksheetId={currentWorksheetId}
                onRefresh={() => {}}
              />
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
