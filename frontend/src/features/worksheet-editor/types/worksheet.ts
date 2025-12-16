/**
 * TypeScript types for Worksheet Editor (WYSIWYG)
 */

export type BoxSize = 'SIZE_8MM' | 'SIZE_10MM' | 'SIZE_12MM';
export type RowType = 'HEADER' | 'TEXT' | 'GRID' | 'VOCABULARY';

export interface BaseRow {
  id: string;
  type: RowType;
  order: number;
  name?: string; // Optional custom name for layer panel
}

export interface HeaderRow extends BaseRow {
  type: 'HEADER';
  showDate: boolean;
  showName: boolean;
  title?: string;
}

export interface TextRow extends BaseRow {
  type: 'TEXT';
  content: string;
  fontSize: number; // 8-24pt
  bold: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface CharacterBox {
  id: string;
  furigana: string;
  text: string;
}

export interface GridSection {
  id: string;
  boxSize: BoxSize;
  boxes: CharacterBox[];
  showGuides: boolean;
}

export interface GridRow extends BaseRow {
  type: 'GRID';
  sections: GridSection[];
}

export interface VocabTerm {
  id: string;
  term: string;
  meaning: string;
}

export interface VocabularyRow extends BaseRow {
  type: 'VOCABULARY';
  terms: VocabTerm[];
  columns: 1 | 2 | 3;
  lineStyle: 'dashed' | 'solid';
  fontSize?: number; // 8-24pt, defaults to 12
}

export type WorksheetRow = HeaderRow | TextRow | GridRow | VocabularyRow;

export interface WorksheetConfig {
  title: string;
  showGuideLines: boolean;
  rows: WorksheetRow[];
}

export interface Page {
  pageNumber: number;
  rowIds: string[];
  usedHeight: number; // in px
}

export interface WorksheetState {
  // Document state
  title: string;
  showGuideLines: boolean;
  rows: WorksheetRow[];

  // UI state
  selectedRowId: string | null;
  selectedElementId: string | null;
  zoom: number;
  activeSidebarTab: 'properties' | 'layers';

  // Pagination state (computed)
  pages: Page[];

  // Row heights cache (for pagination)
  rowHeights: Map<string, number>;
}
