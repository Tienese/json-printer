import { useState, useCallback } from 'react';
import type { WorksheetItem, WorksheetMetadata, WorksheetPage, ViewMode } from '../types/worksheet';
import { createPage } from '../utils/worksheetFactory';
import { aiLog } from '../utils/aiLogger';
import { devAssert } from '../utils/devAssert';

/**
 * Multi-page worksheet state management hook.
 * Manages pages, items within pages, and page navigation.
 * All state mutations are logged via aiLog for debugging.
 */
export function useWorksheet(initialItems: WorksheetItem[] = []) {
    // Initialize with one page containing initial items
    const [pages, setPages] = useState<WorksheetPage[]>(() => {
        aiLog.state('useWorksheet', 'INIT', { initialItemCount: initialItems.length });
        return [{ id: crypto.randomUUID(), items: initialItems }];
    });
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<WorksheetItem | null>(null);
    const [mode, setMode] = useState<ViewMode>('teacher');
    const [metadata, setMetadata] = useState<WorksheetMetadata>({
        title: 'Untitled Worksheet',
        subject: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '2.0',
    });

    // Current page helpers
    const currentPage = pages[currentPageIndex];
    const items = currentPage?.items || [];
    const totalPages = pages.length;

    // Page navigation
    const goToPage = useCallback((index: number) => {
        if (index >= 0 && index < pages.length) {
            aiLog.state('useWorksheet', 'GO_TO_PAGE', { from: currentPageIndex, to: index, totalPages: pages.length });
            setCurrentPageIndex(index);
            setSelectedItem(null);
        }
    }, [pages.length, currentPageIndex]);

    const nextPage = useCallback(() => goToPage(currentPageIndex + 1), [currentPageIndex, goToPage]);
    const prevPage = useCallback(() => goToPage(currentPageIndex - 1), [currentPageIndex, goToPage]);

    // Add new page
    const addPage = useCallback(() => {
        const newPage = createPage();
        aiLog.state('useWorksheet', 'PAGE_ADDED', { newPageId: newPage.id, newTotalPages: pages.length + 1 });
        setPages(prev => [...prev, newPage]);
        setCurrentPageIndex(pages.length); // Go to new page
        setSelectedItem(null);
    }, [pages.length]);

    // Delete current page (keep at least one)
    const deletePage = useCallback(() => {
        if (pages.length <= 1) {
            aiLog.state('useWorksheet', 'PAGE_DELETE_BLOCKED', { reason: 'Only one page remaining' });
            return;
        }
        aiLog.state('useWorksheet', 'PAGE_DELETED', { deletedIndex: currentPageIndex, remainingPages: pages.length - 1 });
        setPages(prev => prev.filter((_, i) => i !== currentPageIndex));
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
        setSelectedItem(null);
    }, [pages.length, currentPageIndex]);

    // Item selection
    const handleSelectItem = useCallback((item: WorksheetItem | null) => {
        aiLog.state('useWorksheet', 'ITEM_SELECTED', {
            itemId: item?.id || null,
            itemType: item?.type || null
        });
        setSelectedItem(item);
    }, []);

    // Update item in current page
    const updateItem = useCallback((updated: WorksheetItem) => {
        aiLog.state('useWorksheet', 'ITEM_UPDATED', {
            itemId: updated.id,
            itemType: updated.type,
            pageIndex: currentPageIndex
        });
        setPages(prev => prev.map((page, i) =>
            i === currentPageIndex
                ? { ...page, items: page.items.map(item => item.id === updated.id ? updated : item) }
                : page
        ));
        setSelectedItem(updated);
    }, [currentPageIndex]);

    // Helper: Recalculate prompt numbers across ALL pages sequentially
    const recalculatePromptNumbers = useCallback((inputPages: WorksheetPage[]): WorksheetPage[] => {
        let globalNumber = 1;
        return inputPages.map(page => ({
            ...page,
            items: page.items.map(item => {
                if ('showPromptNumber' in item && item.showPromptNumber) {
                    return { ...item, promptNumber: globalNumber++ };
                }
                return item;
            })
        }));
    }, []);

    // Add item to current page (recalculates ALL prompt numbers)
    const addItem = useCallback((newItem: WorksheetItem, index?: number) => {
        const prevItemCount = pages[currentPageIndex].items.length;
        const insertIndex = index ?? prevItemCount;

        aiLog.state('useWorksheet', 'ITEM_ADDED', {
            itemId: newItem.id,
            itemType: newItem.type,
            insertIndex,
            pageIndex: currentPageIndex
        });

        setPages(prev => {
            // First, add the item
            const newPages = prev.map((page, i) => {
                if (i !== currentPageIndex) return page;
                const newItems = [...page.items];
                newItems.splice(insertIndex, 0, newItem);
                return { ...page, items: newItems };
            });
            // Then recalculate all prompt numbers
            const result = recalculatePromptNumbers(newPages);

            // Assert: Item count should increase by 1
            void devAssert.check('useWorksheet', 'ADD_ITEM', {
                expected: prevItemCount + 1,
                actual: result[currentPageIndex].items.length,
                message: `Item count after adding ${newItem.type}`,
                snapshot: () => ({ pages: result, newItem, currentPageIndex })
            });

            return result;
        });
        setSelectedItem(newItem);
    }, [currentPageIndex, recalculatePromptNumbers, pages]);

    // Delete item from current page (recalculates ALL prompt numbers)
    const deleteItem = useCallback((itemToDelete: WorksheetItem) => {
        const prevItemCount = pages[currentPageIndex].items.length;

        aiLog.state('useWorksheet', 'ITEM_DELETED', {
            itemId: itemToDelete.id,
            itemType: itemToDelete.type,
            pageIndex: currentPageIndex
        });

        setPages(prev => {
            const newPages = prev.map((page, i) =>
                i === currentPageIndex
                    ? { ...page, items: page.items.filter(item => item.id !== itemToDelete.id) }
                    : page
            );
            // Recalculate all prompt numbers after deletion
            const result = recalculatePromptNumbers(newPages);

            // Assert: Item count should decrease by 1
            void devAssert.check('useWorksheet', 'DELETE_ITEM', {
                expected: prevItemCount - 1,
                actual: result[currentPageIndex].items.length,
                message: `Item count after deleting ${itemToDelete.type}`,
                snapshot: () => ({ pages: result, deletedItem: itemToDelete, currentPageIndex })
            });

            return result;
        });
        setSelectedItem(null);
    }, [currentPageIndex, recalculatePromptNumbers, pages]);

    // Set all items for current page (for reordering)
    const setItems = useCallback((newItems: WorksheetItem[]) => {
        aiLog.state('useWorksheet', 'ITEMS_REORDERED', {
            itemCount: newItems.length,
            pageIndex: currentPageIndex
        });
        setPages(prev => prev.map((page, i) =>
            i === currentPageIndex ? { ...page, items: newItems } : page
        ));
    }, [currentPageIndex]);

    // Set all pages (for loading)
    const setAllPages = useCallback((newPages: WorksheetPage[]) => {
        const finalPages = newPages.length > 0 ? newPages : [createPage()];
        const totalItems = finalPages.reduce((sum, p) => sum + p.items.length, 0);
        aiLog.state('useWorksheet', 'PAGES_LOADED', {
            pageCount: finalPages.length,
            totalItems
        });
        setPages(finalPages);
        setCurrentPageIndex(0);
        setSelectedItem(null);
    }, []);

    // Mode toggle
    const toggleMode = useCallback(() => {
        setMode(prev => {
            const newMode = prev === 'teacher' ? 'student' : 'teacher';
            aiLog.state('useWorksheet', 'MODE_TOGGLED', { from: prev, to: newMode });
            return newMode;
        });
    }, []);

    // Metadata update
    const updateMetadata = useCallback((newMetadata: WorksheetMetadata) => {
        aiLog.state('useWorksheet', 'METADATA_UPDATED', {
            title: newMetadata.title,
            subject: newMetadata.subject
        });
        setMetadata({ ...newMetadata, updatedAt: new Date().toISOString() });
    }, []);

    // Add vocab term (convenience)
    const addVocabTerm = useCallback((itemId: string) => {
        aiLog.action('useWorksheet', 'VOCAB_TERM_ADDED', { itemId });
        setPages(prev => prev.map((page, i) => {
            if (i !== currentPageIndex) return page;
            return {
                ...page,
                items: page.items.map(item => {
                    if (item.id !== itemId || item.type !== 'VOCAB') return item;
                    return {
                        ...item,
                        terms: [...item.terms, { id: crypto.randomUUID(), term: '', meaning: '' }]
                    };
                })
            };
        }));
    }, [currentPageIndex]);

    // Add T/F question (convenience)
    const addTFQuestion = useCallback((itemId: string) => {
        aiLog.action('useWorksheet', 'TF_QUESTION_ADDED', { itemId });
        setPages(prev => prev.map((page, i) => {
            if (i !== currentPageIndex) return page;
            return {
                ...page,
                items: page.items.map(item => {
                    if (item.id !== itemId || item.type !== 'TRUE_FALSE') return item;
                    return {
                        ...item,
                        questions: [...item.questions, { id: crypto.randomUUID(), text: '', correctAnswer: true, showReasoning: true }]
                    };
                })
            };
        }));
    }, [currentPageIndex]);

    return {
        // Current page state
        items,
        pages,
        currentPageIndex,
        totalPages,
        selectedItem,
        mode,
        metadata,

        // Page navigation
        goToPage,
        nextPage,
        prevPage,
        addPage,
        deletePage,

        // Item operations
        handleSelectItem,
        updateItem,
        addItem,
        deleteItem,
        setItems,
        setAllPages,

        // Mode & metadata
        toggleMode,
        updateMetadata,

        // Convenience
        addVocabTerm,
        addTFQuestion,
    };
}
