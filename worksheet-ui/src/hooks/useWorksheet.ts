import { useState, useCallback } from 'react';
import type { WorksheetItem, WorksheetMetadata, WorksheetPage, ViewMode } from '../types/worksheet';
import { createPage } from '../utils/worksheetFactory';

/**
 * Multi-page worksheet state management hook.
 * Manages pages, items within pages, and page navigation.
 */
export function useWorksheet(initialItems: WorksheetItem[] = []) {
    // Initialize with one page containing initial items
    const [pages, setPages] = useState<WorksheetPage[]>(() => [
        { id: crypto.randomUUID(), items: initialItems }
    ]);
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
            setCurrentPageIndex(index);
            setSelectedItem(null);
        }
    }, [pages.length]);

    const nextPage = useCallback(() => goToPage(currentPageIndex + 1), [currentPageIndex, goToPage]);
    const prevPage = useCallback(() => goToPage(currentPageIndex - 1), [currentPageIndex, goToPage]);

    // Add new page
    const addPage = useCallback(() => {
        const newPage = createPage();
        setPages(prev => [...prev, newPage]);
        setCurrentPageIndex(pages.length); // Go to new page
        setSelectedItem(null);
    }, [pages.length]);

    // Delete current page (keep at least one)
    const deletePage = useCallback(() => {
        if (pages.length <= 1) return;

        setPages(prev => prev.filter((_, i) => i !== currentPageIndex));
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
        setSelectedItem(null);
    }, [pages.length, currentPageIndex]);

    // Item selection
    const handleSelectItem = useCallback((item: WorksheetItem | null) => {
        setSelectedItem(item);
    }, []);

    // Update item in current page
    const updateItem = useCallback((updated: WorksheetItem) => {
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
        setPages(prev => {
            // First, add the item
            const insertIndex = index ?? prev[currentPageIndex].items.length;
            const newPages = prev.map((page, i) => {
                if (i !== currentPageIndex) return page;
                const newItems = [...page.items];
                newItems.splice(insertIndex, 0, newItem);
                return { ...page, items: newItems };
            });
            // Then recalculate all prompt numbers
            return recalculatePromptNumbers(newPages);
        });
        setSelectedItem(newItem);
    }, [currentPageIndex, recalculatePromptNumbers]);

    // Delete item from current page (recalculates ALL prompt numbers)
    const deleteItem = useCallback((itemToDelete: WorksheetItem) => {
        setPages(prev => {
            const newPages = prev.map((page, i) =>
                i === currentPageIndex
                    ? { ...page, items: page.items.filter(item => item.id !== itemToDelete.id) }
                    : page
            );
            // Recalculate all prompt numbers after deletion
            return recalculatePromptNumbers(newPages);
        });
        setSelectedItem(null);
    }, [currentPageIndex, recalculatePromptNumbers]);

    // Set all items for current page (for reordering)
    const setItems = useCallback((newItems: WorksheetItem[]) => {
        setPages(prev => prev.map((page, i) =>
            i === currentPageIndex ? { ...page, items: newItems } : page
        ));
    }, [currentPageIndex]);

    // Set all pages (for loading)
    const setAllPages = useCallback((newPages: WorksheetPage[]) => {
        setPages(newPages.length > 0 ? newPages : [createPage()]);
        setCurrentPageIndex(0);
        setSelectedItem(null);
    }, []);

    // Mode toggle
    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'teacher' ? 'student' : 'teacher');
    }, []);

    // Metadata update
    const updateMetadata = useCallback((newMetadata: WorksheetMetadata) => {
        setMetadata({ ...newMetadata, updatedAt: new Date().toISOString() });
    }, []);

    // Add vocab term (convenience)
    const addVocabTerm = useCallback((itemId: string) => {
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
