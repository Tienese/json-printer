import React, { useEffect, useState } from 'react';
import type { WorksheetItem, ViewMode, WorksheetTemplate } from '../types/worksheet';
import { HeaderItemComponent } from '../components/HeaderItem';
import { GridItemComponent } from '../components/GridItem';
import { CardItemComponent } from '../components/CardItem';
import { VocabItemComponent } from '../components/VocabItem';
import { MultipleChoiceItemComponent } from '../components/items/MultipleChoiceItem';
import { TrueFalseItemComponent } from '../components/items/TrueFalseItem';
import { MatchingItemComponent } from '../components/items/MatchingItem';
import { ClozeItemComponent } from '../components/items/ClozeItem';
import { useWorksheet } from '../hooks/useWorksheet';
import { Sidebar } from '../components/Sidebar';
import { MenuBar } from '../components/MenuBar';
import { StatusBar } from '../components/StatusBar';
import { ContextMenuPortal } from '../components/ContextMenuPortal';
import { CoachSidebar } from '../components/CoachSidebar';

import { saveWorksheetToFile, loadWorksheetFromFile } from '../utils/worksheetStorage';
import { createMultipleChoiceItem, createTrueFalseItem, createMatchingItem, createClozeItem, createCardItem, createGridItem, createVocabItem } from '../utils/worksheetFactory';
import { useAutoSave } from '../hooks/useAutoSave';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';
import { aiLog } from '../utils/aiLogger';

// Helper to create items based on type
const createItemByType = (type: string): WorksheetItem => {
  switch (type) {
    case 'CARD': return createCardItem();
    case 'GRID': return createGridItem();
    case 'VOCAB': return createVocabItem();
    case 'MULTIPLE_CHOICE': return createMultipleChoiceItem();
    case 'TRUE_FALSE': return createTrueFalseItem();
    case 'MATCHING': return createMatchingItem();
    case 'CLOZE': return createClozeItem();
    default: throw new Error(`Unknown item type: ${type}`);
  }
};

interface WorksheetItemRendererProps {
  readonly item: WorksheetItem;
  readonly mode: ViewMode;
  readonly isSelected: boolean;
  readonly isPreviewMode: boolean;
  readonly onUpdate: (item: any) => void;
}

// Extracted component to render specific worksheet items
function WorksheetItemRenderer({
  item,
  mode,
  isSelected,
  isPreviewMode,
  onUpdate
}: WorksheetItemRendererProps) {
  const updateHandler = isPreviewMode ? () => { } : onUpdate;

  switch (item.type) {
    case 'HEADER':
      return <HeaderItemComponent key={item.id} item={item as any} onUpdate={updateHandler} />;
    case 'CARD':
      return <CardItemComponent key={item.id} item={item as any} onUpdate={updateHandler} />;
    case 'GRID':
      return <GridItemComponent key={item.id} item={item as any} isSelected={isSelected} onUpdate={updateHandler} />;
    case 'VOCAB':
      return <VocabItemComponent key={item.id} item={item as any} onUpdate={updateHandler} />;
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceItemComponent key={item.id} item={item as any} mode={mode} onUpdate={updateHandler} />;
    case 'TRUE_FALSE':
      return <TrueFalseItemComponent key={item.id} item={item as any} mode={mode} onUpdate={updateHandler} />;
    case 'MATCHING':
      return <MatchingItemComponent key={item.id} item={item as any} mode={mode} onUpdate={updateHandler} />;
    case 'CLOZE':
      return <ClozeItemComponent key={item.id} item={item as any} mode={mode} />;
    default:
      return <div>Unknown item type: {(item as any).type}</div>;
  }
}


interface WorksheetPageProps {
  readonly onNavigate?: (route: string) => void;
  readonly worksheetId?: string;
}

export function WorksheetPage({ onNavigate, worksheetId }: WorksheetPageProps) {
  const {
    items,
    pages,
    currentPageIndex,
    totalPages,
    selectedItem,
    mode,
    metadata,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    handleSelectItem,
    updateItem,
    addItem,
    deleteItem,
    setItems,
    toggleMode,
    updateMetadata,
    addVocabTerm,
    addTFQuestion,
    setAllPages,
  } = useWorksheet([]);

  const [currentWorksheetId, setCurrentWorksheetId] = useState<number | null>(
    worksheetId ? Number(worksheetId) : null
  );
  const { history, triggerManualSave } = useAutoSave(pages, metadata, currentWorksheetId);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);  // Collapsed by default
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);  // Coach sidebar collapsed by default
  const [previewTemplate, setPreviewTemplate] = useState<WorksheetTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);  // 1 = 100%, for printable area readability

  // Load worksheet from server if ID is provided
  useEffect(() => {
    async function loadWorksheet() {
      if (!worksheetId) return;

      aiLog.action('WorksheetPage', 'LOAD_FROM_SERVER_STARTED', { worksheetId });
      try {
        const { worksheetApi } = await import('../api/worksheets');
        const worksheet = await worksheetApi.get(Number(worksheetId));
        const template: WorksheetTemplate = JSON.parse(worksheet.jsonContent);

        aiLog.state('WorksheetPage', 'LOAD_FROM_SERVER_SUCCESS', {
          worksheetId,
          pageCount: template.pages?.length || 0,
          title: template.metadata?.title
        });
        setAllPages(template.pages);
        updateMetadata(template.metadata);
      } catch (error) {
        aiLog.error('WorksheetPage', 'LOAD_FROM_SERVER_FAILED', error);
        console.error('Failed to load worksheet:', error);
      }
    }

    loadWorksheet();
  }, [worksheetId, setAllPages, updateMetadata]);


  // AI Debug: Log page mount
  useEffect(() => {
    aiLog.mount('WorksheetPage', '#worksheet', {
      mode,
      itemCount: items.length,
      selectedItemId: selectedItem?.id || null
    });
  }, []);

  // AI Debug: Log mode changes
  useEffect(() => {
    aiLog.state('WorksheetPage', 'MODE_CHANGED', { mode, itemCount: items.length });
  }, [mode]);

  const isPreviewMode = !!previewTemplate;
  // For preview, show first page items (simplified); for editing, show current page items
  const displayItems = previewTemplate
    ? (previewTemplate.pages?.[0]?.items || [])
    : items;
  const displayMetadata = previewTemplate ? previewTemplate.metadata : metadata;

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'ADD' | 'DELETE';
    index?: number;
    targetItem?: WorksheetItem;
  } | null>(null);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    globalThis.addEventListener('click', handleClick);
    return () => globalThis.removeEventListener('click', handleClick);
  }, []);

  const handleSave = () => {
    aiLog.action('WorksheetPage', 'SAVE_TO_FILE', {
      pageCount: pages.length,
      title: metadata.title
    });
    saveWorksheetToFile({ metadata, pages });
  };

  const handleLoad = async () => {
    aiLog.action('WorksheetPage', 'LOAD_FROM_FILE_STARTED', {});
    const template = await loadWorksheetFromFile();
    if (template) {
      aiLog.state('WorksheetPage', 'LOAD_FROM_FILE_SUCCESS', {
        pageCount: template.pages?.length || 0
      });
      setAllPages(template.pages);
      updateMetadata(template.metadata);
    } else {
      aiLog.state('WorksheetPage', 'LOAD_FROM_FILE_CANCELLED', {});
    }
  };

  const handleSaveToCloud = async () => {
    aiLog.action('WorksheetPage', 'SAVE_TO_CLOUD_STARTED', {
      worksheetId: currentWorksheetId,
      isNew: !currentWorksheetId
    });
    setIsSaving(true);
    try {
      const { worksheetApi } = await import('../api/worksheets');
      const template = { metadata, pages };
      const jsonContent = JSON.stringify(template);

      // Calculate metadata counts
      const allItems = pages.flatMap(p => p.items);
      const metadataJson = JSON.stringify({
        gridCount: allItems.filter(i => i.type === 'GRID').length,
        vocabCount: allItems.filter(i => i.type === 'VOCAB').length,
        textCount: allItems.filter(i => i.type === 'CARD').length,
        mcCount: allItems.filter(i => i.type === 'MULTIPLE_CHOICE').length,
        tfCount: allItems.filter(i => i.type === 'TRUE_FALSE').length,
        matchingCount: allItems.filter(i => i.type === 'MATCHING').length,
        clozeCount: allItems.filter(i => i.type === 'CLOZE').length,
      });

      if (currentWorksheetId) {
        // Update existing worksheet
        await worksheetApi.update(currentWorksheetId, {
          name: metadata.title || 'Untitled Worksheet',
          jsonContent,
          metadata: metadataJson,
        });
        aiLog.state('WorksheetPage', 'SAVE_TO_CLOUD_UPDATE_SUCCESS', { worksheetId: currentWorksheetId });
      } else {
        // Create new worksheet
        const saved = await worksheetApi.create({
          name: metadata.title || 'Untitled Worksheet',
          jsonContent,
          type: 'SNAPSHOT',
          metadata: metadataJson,
        });
        aiLog.state('WorksheetPage', 'SAVE_TO_CLOUD_CREATE_SUCCESS', { newWorksheetId: saved.id });
        setCurrentWorksheetId(saved.id);
      }

      alert('Worksheet saved successfully!');
    } catch (error) {
      aiLog.error('WorksheetPage', 'SAVE_TO_CLOUD_FAILED', error);
      console.error('Failed to save worksheet:', error);
      alert('Failed to save worksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'ADD' | 'DELETE', item?: WorksheetItem) => {
    e.preventDefault();
    aiLog.action('WorksheetPage', 'CONTEXT_MENU_OPENED', {
      type,
      itemId: item?.id || null,
      itemType: item?.type || null
    });
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      targetItem: item
    });
  };

  const addNewItem = (type: string, index: number) => {
    aiLog.action('WorksheetPage', 'ADD_NEW_ITEM', { type, index });
    const newItem = createItemByType(type);
    addItem(newItem, index);
    setContextMenu(null);
  };


  return (
    <div className={`grid grid-rows-[auto_1fr_auto] h-screen w-full theme-bg overflow-hidden print:bg-white print:h-auto print:overflow-visible print:block ${isLeftSidebarOpen ? 'grid-cols-[300px_1fr_auto]' : 'grid-cols-[40px_1fr_auto]'}`}>
      {/* Top Menu Bar */}
      <div className="col-span-3 print:hidden">
        <Navbar
          onBack={() => onNavigate?.(ROUTES.HOME)}
          actions={
            <MenuBar
              onSaveToCloud={handleSaveToCloud}
              onSaveToFile={handleSave}
              onLoadFromFile={handleLoad}
              onSnapshot={triggerManualSave}
              history={history}
              onPreviewHistory={setPreviewTemplate}
              isSaving={isSaving}
              mode={mode}
              onToggleMode={toggleMode}
              onAddItem={(type) => addItem(createItemByType(type), items.length)}
              onNavigate={onNavigate}
            />
          }
        />
      </div>

      {/* Left Sidebar - Coach Panel */}
      <div className="row-span-1 border-r theme-border theme-surface print:hidden h-full overflow-hidden flex flex-col">
        <CoachSidebar
          worksheetId={currentWorksheetId}
          worksheetJson={JSON.stringify({ metadata, pages })}
          isOpen={isLeftSidebarOpen}
          onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />
      </div>

      {/* Main Content Area */}
      <main
        className="overflow-auto p-10 bg-app-gray flex flex-col items-center print:hidden scroll-smooth outline-none"
        onClick={() => !isPreviewMode && handleSelectItem(null)}
        onKeyDown={(e) => { if (e.key === 'Escape') !isPreviewMode && handleSelectItem(null); }}
        onContextMenu={(e) => {
          // Only prevent default, no menu on canvas background
          e.preventDefault();
        }}
        tabIndex={-1}
      >
        {isPreviewMode && (
          <div className="mb-6 w-[210mm] bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <p className="text-amber-900 font-bold leading-tight">Previewing History Version</p>
                <p className="text-amber-700 text-sm">You are viewing a previous save. Editing is disabled.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 theme-surface border border-amber-200 text-amber-900 rounded-lg hover:bg-amber-100 transition-colors font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAllPages(previewTemplate.pages);
                  updateMetadata(previewTemplate.metadata);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-bold shadow-md shadow-amber-200"
              >
                Restore this version
              </button>
            </div>
          </div>
        )}



        <section
          className={`relative mb-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-[1.27cm] box-border w-[210mm] min-h-[297mm] flex flex-col origin-top transition-transform duration-200 outline-none print:hidden ${isPreviewMode ? 'ring-4 ring-amber-400 pointer-events-none opacity-80' : ''}`}
          style={{ transform: `scale(${zoom})`, marginBottom: `${Math.max(0, (zoom - 1) * 297) + 40}mm` }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
          onContextMenu={(e) => {
            // Right-click on printing area shows ADD menu
            if (!isPreviewMode) {
              e.stopPropagation();
              handleContextMenu(e, 'ADD');
            }
          }}
          aria-label="Worksheet Editor Content"
        >
          {displayItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl m-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14.5 2 14.5 7.5 20 7.5" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
              <p className="text-xl font-medium">Worksheet is empty</p>
              <p className="text-sm">Right click or use Insert menu to add content</p>
            </div>
          ) : (
            displayItems.map((item) => {
              const worksheetItemRenderer = (
                <WorksheetItemRenderer
                  item={item}
                  mode={mode}
                  isSelected={selectedItem?.id === item.id}
                  isPreviewMode={isPreviewMode}
                  onUpdate={updateItem}
                />
              );

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPreviewMode) handleSelectItem(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      if (!isPreviewMode) handleSelectItem(item);
                    }
                  }}
                  onContextMenu={(e) => {
                    if (!isPreviewMode) {
                      e.stopPropagation();
                      handleSelectItem(item);
                      handleContextMenu(e, 'DELETE', item);
                    }
                  }}
                  role="button"
                  tabIndex={isPreviewMode ? -1 : 0}
                  aria-pressed={selectedItem?.id === item.id}
                  className={`group/item relative rounded-lg mb-[2mm] p-0 min-h-[3mm] box-border print:border-none print:mb-[1.5mm] outline-none text-left w-full block bg-transparent border-none ${selectedItem?.id === item.id ? 'ring-2 ring-gray-400 shadow-lg shadow-gray-100 ring-offset-2 z-10 print:ring-0' : ''}`}>
                  {worksheetItemRenderer}

                  {!isPreviewMode && selectedItem?.id === item.id && (
                    <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity print:hidden">
                      <button
                        onClick={() => deleteItem(item)}
                        className="p-2 theme-surface text-red-500 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Right Sidebar - Properties with Tabs */}
      <div className="row-span-1 border-l theme-border theme-surface print:hidden h-full overflow-hidden flex flex-col">
        <Sidebar
          itemsState={{
            items: displayItems,
            selectedItem,
            onSelectItem: handleSelectItem,
            onUpdate: updateItem,
            onDelete: deleteItem,
            onReorderItems: setItems
          }}
          metadataState={{
            metadata: displayMetadata,
            onUpdateMetadata: updateMetadata
          }}
          pageState={{
            currentPageIndex,
            totalPages,
            onPrevPage: prevPage,
            onNextPage: nextPage,
            onAddPage: addPage,
            onDeletePage: deletePage
          }}
          onAddVocabTerm={addVocabTerm}
          onAddTFQuestion={addTFQuestion}
          isOpen={isRightSidebarOpen}
          onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        />
      </div>

      {/* Print-Only: Render ALL pages with page breaks - OUTSIDE main */}
      <div className="hidden print:block print:absolute print:inset-0 print:p-0 print:m-0 print:z-50">
        {pages.map((page) => (
          <div key={page.id} className="print-page">
            {page.items.map((item) => (
              <div key={item.id} className="mb-[1.5mm]">
                <WorksheetItemRenderer
                  item={item}
                  mode={mode}
                  isSelected={false}
                  isPreviewMode={true}
                  onUpdate={() => { }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenuPortal
          position={{ x: contextMenu.x, y: contextMenu.y }}
          type={contextMenu.type}
          targetItem={contextMenu.targetItem}
          onAddItem={(type) => addNewItem(type, items.length)}
          onDeleteItem={deleteItem}
        />
      )}

      {/* Bottom Status Bar */}
      <StatusBar
        pages={pages}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </div>
  );
}
