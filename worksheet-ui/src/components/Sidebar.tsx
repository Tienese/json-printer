import { useState, useEffect } from "react";
import type { WorksheetItem, WorksheetMetadata } from "../types/worksheet";
import { GridItemEditor } from "./editors/GridItemEditor";
import { HeaderItemEditor } from "./editors/HeaderItemEditor";
import { TextItemEditor } from "./editors/TextItemEditor";
import { VocabItemEditor } from "./editors/VocabItemEditor";
import { MultipleChoiceEditor } from "./editors/question-editors/MultipleChoiceEditor";
import { TrueFalseEditor } from "./editors/question-editors/TrueFalseEditor";
import { MatchingEditor } from "./editors/question-editors/MatchingEditor";
import { ClozeEditor } from "./editors/question-editors/ClozeEditor";

import { LayersPanel } from "./LayersPanel";

interface SidebarProps {
  items: WorksheetItem[];
  selectedItem: WorksheetItem | null;
  onSelectItem: (item: WorksheetItem | null) => void;
  onUpdate: (item: WorksheetItem) => void;
  onDelete: (item: WorksheetItem) => void;
  onReorderItems: (newItems: WorksheetItem[]) => void;
  metadata: WorksheetMetadata;
  onUpdateMetadata: (metadata: WorksheetMetadata) => void;
  onAddVocabTerm: (itemId: string, term: any) => void;
  onAddTFQuestion: (itemId: string, question: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  // Page navigation
  currentPageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export function Sidebar({
  items,
  selectedItem,
  onSelectItem,
  onUpdate,
  onDelete,
  onReorderItems,
  metadata,
  onUpdateMetadata,
  onAddVocabTerm,
  onAddTFQuestion,
  isOpen,
  onToggle,
  currentPageIndex,
  totalPages,
  onPrevPage,
  onNextPage,
  onAddPage,
  onDeletePage
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');

  // Auto-switch tabs based on selection
  useEffect(() => {
    if (selectedItem) {
      setActiveTab('properties');
    } else {
      setActiveTab('layers');
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
            case 'TEXT':
              return <TextItemEditor item={selectedItem} onUpdate={onUpdate} />;
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

  return (
    <div className={`shrink-0 bg-sidebar-bg border-l border-gray-200 flex flex-col h-full relative transition-all duration-300 print:hidden ${isOpen ? 'w-[300px]' : 'w-[40px] items-center'}`}>
      {/* Sidebar Title Bar / Collapse Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 h-[45px] w-full">
        {isOpen && <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Properties</h2>}
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
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 w-full">
            <button
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'layers' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('layers')}
            >
              Outline
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'properties' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('properties')}
            >
              Properties
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto w-full">
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

            {activeTab === 'properties' && (
              <div className="p-4 animate-in fade-in slide-in-from-right-1">
                {renderEditor()}
              </div>
            )}
          </div>
        </>
      )}
      {!isOpen && (
        <div className="flex flex-col items-center py-4 gap-4">
          <div className={`w-2 h-2 rounded-full ${selectedItem ? 'bg-blue-500' : 'bg-gray-300'}`} title={selectedItem ? "Item Selected" : "No Selection"}></div>
        </div>
      )}
    </div>
  );
}
