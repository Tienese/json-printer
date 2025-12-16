/**
 * Zustand store for Worksheet Editor state management
 * Uses Immer for immutable updates and devtools for debugging
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable Immer to work with Map and Set
enableMapSet();
import type {
  WorksheetState,
  WorksheetRow,
  RowType,
  GridSection,
  BoxSize,
} from '../types/worksheet';
import {
  createRow,
  createGridSection,
  createVocabTerm,
  createCharacterBox,
} from '../utils/rowFactory';
import { DEFAULT_ZOOM, USABLE_HEIGHT_PX } from '../utils/constants';

interface WorksheetActions {
  // Document actions
  setTitle: (title: string) => void;
  toggleGuideLines: () => void;

  // Row CRUD
  addRow: (type: RowType, afterRowId?: string) => void;
  updateRow: (id: string, updates: Partial<WorksheetRow>) => void;
  deleteRow: (id: string) => void;
  reorderRows: (sourceId: string, destinationId: string) => void;
  duplicateRow: (id: string) => void;

  // Selection
  selectRow: (id: string | null) => void;
  selectElement: (rowId: string, elementId: string) => void;
  clearSelection: () => void;

  // Grid operations
  addGridSection: (
    rowId: string,
    position: 'left' | 'right',
    targetSectionId?: string
  ) => void;
  updateGridSection: (
    rowId: string,
    sectionId: string,
    updates: Partial<GridSection>
  ) => void;
  deleteGridSection: (rowId: string, sectionId: string) => void;
  changeBoxSize: (rowId: string, sectionId: string, size: BoxSize) => void;
  modifyBoxCount: (rowId: string, sectionId: string, delta: number) => void;
  updateBox: (
    rowId: string,
    sectionId: string,
    boxId: string,
    field: 'text' | 'furigana',
    value: string
  ) => void;
  reorderGridSections: (
    rowId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;

  // Vocabulary operations
  addVocabTerm: (rowId: string) => void;
  removeVocabTerm: (rowId: string, index: number) => void;
  updateVocabTerm: (
    rowId: string,
    index: number,
    field: 'term' | 'meaning',
    value: string
  ) => void;
  setVocabColumns: (rowId: string, columns: 1 | 2 | 3) => void;
  setVocabLineStyle: (rowId: string, style: 'dashed' | 'solid') => void;
  setVocabFontSize: (rowId: string, fontSize: number) => void;

  // Row naming
  renameRow: (id: string, name: string) => void;

  // Pagination
  setRowHeight: (rowId: string, height: number) => void;
  recalculatePagination: () => void;

  // Zoom & UI
  setZoom: (zoom: number) => void;
  setActiveSidebarTab: (tab: 'properties' | 'layers') => void;

  // Reset
  resetWorksheet: () => void;
}

type WorksheetStore = WorksheetState & WorksheetActions;

const initialState: WorksheetState = {
  title: 'Untitled Worksheet',
  showGuideLines: true,
  rows: [],
  selectedRowId: null,
  selectedElementId: null,
  zoom: DEFAULT_ZOOM,
  activeSidebarTab: 'properties',
  pages: [],
  rowHeights: new Map(),
};

export const useWorksheetStore = create<WorksheetStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // Document actions
        setTitle: (title) => set({ title }),

        toggleGuideLines: () =>
          set((state) => {
            state.showGuideLines = !state.showGuideLines;
          }),

        // Row CRUD
        addRow: (type, afterRowId) =>
          set((state) => {
            const newRow = createRow(type, state.rows.length);

            if (afterRowId) {
              const index = state.rows.findIndex((r) => r.id === afterRowId);
              state.rows.splice(index + 1, 0, newRow);
            } else {
              state.rows.push(newRow);
            }

            // Re-order all rows
            state.rows.forEach((row, idx) => {
              row.order = idx;
            });

            // Auto-select new row
            state.selectedRowId = newRow.id;
          }),

        updateRow: (id, updates) =>
          set((state) => {
            const row = state.rows.find((r) => r.id === id);
            if (row) {
              Object.assign(row, updates);
            }
          }),

        deleteRow: (id) =>
          set((state) => {
            state.rows = state.rows.filter((r) => r.id !== id);

            // Re-order remaining rows
            state.rows.forEach((row, idx) => {
              row.order = idx;
            });

            // Clear selection if deleted row was selected
            if (state.selectedRowId === id) {
              state.selectedRowId = null;
              state.selectedElementId = null;
            }
          }),

        reorderRows: (sourceId, destinationId) =>
          set((state) => {
            const sourceIndex = state.rows.findIndex((r) => r.id === sourceId);
            const destIndex = state.rows.findIndex(
              (r) => r.id === destinationId
            );

            if (sourceIndex === -1 || destIndex === -1) return;

            // Remove source row
            const [removed] = state.rows.splice(sourceIndex, 1);

            // Insert at destination
            state.rows.splice(destIndex, 0, removed);

            // Re-order all rows
            state.rows.forEach((row, idx) => {
              row.order = idx;
            });
          }),

        duplicateRow: (id) =>
          set((state) => {
            const row = state.rows.find((r) => r.id === id);
            if (!row) return;

            const duplicated = JSON.parse(JSON.stringify(row));
            duplicated.id = `row-${Date.now()}`;

            // Regenerate nested IDs to avoid key conflicts
            if (duplicated.type === 'GRID') {
              duplicated.sections = duplicated.sections.map(
                (section: any, sIdx: number) => ({
                  ...section,
                  id: `section-${Date.now()}-${sIdx}`,
                  boxes: section.boxes.map((box: any, bIdx: number) => ({
                    ...box,
                    id: `box-${Date.now()}-${sIdx}-${bIdx}`,
                  })),
                })
              );
            } else if (duplicated.type === 'VOCABULARY') {
              duplicated.terms = duplicated.terms.map(
                (term: any, tIdx: number) => ({
                  ...term,
                  id: `term-${Date.now()}-${tIdx}`,
                })
              );
            }

            const index = state.rows.findIndex((r) => r.id === id);
            state.rows.splice(index + 1, 0, duplicated);

            // Re-order all rows
            state.rows.forEach((r, idx) => {
              r.order = idx;
            });

            // Auto-select the duplicated row
            state.selectedRowId = duplicated.id;
          }),

        // Selection
        selectRow: (id) =>
          set((state) => {
            state.selectedRowId = id;
            state.selectedElementId = null;
          }),

        selectElement: (rowId, elementId) =>
          set((state) => {
            state.selectedRowId = rowId;
            state.selectedElementId = elementId;
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedRowId = null;
            state.selectedElementId = null;
          }),

        // Grid operations
        addGridSection: (rowId, position, targetSectionId) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            const newSection = createGridSection();

            if (targetSectionId) {
              const index = row.sections.findIndex(
                (s: GridSection) => s.id === targetSectionId
              );
              const insertIndex = position === 'left' ? index : index + 1;
              row.sections.splice(insertIndex, 0, newSection);
            } else {
              row.sections.push(newSection);
            }

            state.selectedElementId = newSection.id;
          }),

        updateGridSection: (rowId, sectionId, updates) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            const section = row.sections.find(
              (s: GridSection) => s.id === sectionId
            );
            if (section) {
              Object.assign(section, updates);
            }
          }),

        deleteGridSection: (rowId, sectionId) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row || row.sections.length <= 1) return;

            row.sections = row.sections.filter(
              (s: GridSection) => s.id !== sectionId
            );

            if (state.selectedElementId === sectionId) {
              state.selectedElementId = null;
            }
          }),

        changeBoxSize: (rowId, sectionId, size) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            const section = row.sections.find(
              (s: GridSection) => s.id === sectionId
            );
            if (section) {
              section.boxSize = size;
            }
          }),

        modifyBoxCount: (rowId, sectionId, delta) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            const section = row.sections.find(
              (s: GridSection) => s.id === sectionId
            );
            if (!section) return;

            const newCount = section.boxes.length + delta;
            if (newCount < 1) return; // Minimum 1 box

            if (delta > 0) {
              // Add boxes
              for (let i = 0; i < delta; i++) {
                section.boxes.push(createCharacterBox());
              }
            } else {
              // Remove boxes
              section.boxes = section.boxes.slice(0, newCount);
            }
          }),

        updateBox: (rowId, sectionId, boxId, field, value) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            const section = row.sections.find(
              (s: GridSection) => s.id === sectionId
            );
            if (!section) return;

            const box = section.boxes.find((b: { id: string }) => b.id === boxId);
            if (box) {
              box[field] = value;
            }
          }),

        reorderGridSections: (rowId, sourceIndex, destinationIndex) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'GRID'
            ) as any;
            if (!row) return;

            if (
              sourceIndex < 0 ||
              sourceIndex >= row.sections.length ||
              destinationIndex < 0 ||
              destinationIndex >= row.sections.length
            ) {
              return;
            }

            const [removed] = row.sections.splice(sourceIndex, 1);
            row.sections.splice(destinationIndex, 0, removed);
          }),

        // Vocabulary operations
        addVocabTerm: (rowId) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row) return;

            row.terms.push(createVocabTerm());
          }),

        removeVocabTerm: (rowId, index) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row || row.terms.length <= 1) return;

            row.terms.splice(index, 1);
          }),

        updateVocabTerm: (rowId, index, field, value) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row) return;

            const term = row.terms[index];
            if (term) {
              term[field] = value;
            }
          }),

        setVocabColumns: (rowId, columns) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row) return;

            row.columns = columns;
          }),

        setVocabLineStyle: (rowId, style) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row) return;

            row.lineStyle = style;
          }),

        setVocabFontSize: (rowId, fontSize) =>
          set((state) => {
            const row = state.rows.find(
              (r) => r.id === rowId && r.type === 'VOCABULARY'
            ) as any;
            if (!row) return;

            row.fontSize = Math.min(Math.max(fontSize, 8), 24);
          }),

        // Row naming
        renameRow: (id, name) =>
          set((state) => {
            const row = state.rows.find((r) => r.id === id);
            if (row) {
              row.name = name;
            }
          }),

        // Pagination
        setRowHeight: (rowId, height) =>
          set((state) => {
            state.rowHeights.set(rowId, height);
          }),

        recalculatePagination: () =>
          set((state) => {
            const pages: typeof state.pages = [];
            let currentPage = {
              pageNumber: 1,
              rowIds: [] as string[],
              usedHeight: 0,
            };

            // Iterate through rows in order
            for (const row of state.rows) {
              const rowHeight = state.rowHeights.get(row.id) || 0;

              // If row is 0 height (not yet measured), add to current page
              if (rowHeight === 0) {
                currentPage.rowIds.push(row.id);
                continue;
              }

              // If row fits on current page, add it
              if (currentPage.usedHeight + rowHeight <= USABLE_HEIGHT_PX) {
                currentPage.rowIds.push(row.id);
                currentPage.usedHeight += rowHeight;
              } else {
                // Current page is full, save it and start a new page
                if (currentPage.rowIds.length > 0) {
                  pages.push({ ...currentPage });
                }

                // Start new page with this row
                currentPage = {
                  pageNumber: pages.length + 1,
                  rowIds: [row.id],
                  usedHeight: rowHeight,
                };

                // Handle oversized rows (taller than one page)
                if (rowHeight > USABLE_HEIGHT_PX && currentPage.rowIds.length === 1) {
                  // Row is too tall for one page, but add it anyway
                  // It will overflow, but at least it's visible
                }
              }
            }

            // Don't forget the last page
            if (currentPage.rowIds.length > 0) {
              pages.push(currentPage);
            }

            // If no pages, create an empty page
            if (pages.length === 0) {
              pages.push({
                pageNumber: 1,
                rowIds: [],
                usedHeight: 0,
              });
            }

            state.pages = pages;
          }),

        // Zoom & UI
        setZoom: (zoom) => set({ zoom }),

        setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

        // Reset
        resetWorksheet: () => set(initialState),
      })),
      {
        name: 'worksheet-storage',
        partialize: (state) => ({
          title: state.title,
          showGuideLines: state.showGuideLines,
          rows: state.rows,
        }),
      }
    )
  )
);
