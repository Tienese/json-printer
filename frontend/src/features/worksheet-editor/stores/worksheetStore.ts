/**
 * Zustand store for Worksheet Editor state management
 * Uses Immer for immutable updates and devtools for debugging
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
import { DEFAULT_ZOOM } from '../utils/constants';

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

            const index = state.rows.findIndex((r) => r.id === id);
            state.rows.splice(index + 1, 0, duplicated);

            // Re-order all rows
            state.rows.forEach((r, idx) => {
              r.order = idx;
            });
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

        // Pagination
        setRowHeight: (rowId, height) =>
          set((state) => {
            state.rowHeights.set(rowId, height);
          }),

        recalculatePagination: () =>
          set((state) => {
            // Pagination logic will be implemented in Phase 3
            // For now, just put all rows on one page
            state.pages = [
              {
                pageNumber: 1,
                rowIds: state.rows.map((r) => r.id),
                usedHeight: 0,
              },
            ];
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
