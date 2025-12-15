/**
 * TypeScript types for Worksheet Builder feature.
 */

export type BoxSize = 'SIZE_10MM' | 'SIZE_8MM' | 'SIZE_6MM';

export type RowType = 'HEADER' | 'TEXT' | 'GRID' | 'VOCABULARY';

export interface WorksheetRow {
  id: string;
  type: RowType;
  order: number;
}

export interface HeaderRow extends WorksheetRow {
  type: 'HEADER';
  showDate: boolean;
  showName: boolean;
  title?: string;
}

export interface TextRow extends WorksheetRow {
  type: 'TEXT';
  text: string;
  fontSize: number;
  bold: boolean;
}

export interface GridSection {
  id: string;
  boxSize: BoxSize;
  boxCount: number;
  content: string;
  showGuides: boolean;
}

export interface GridRow extends WorksheetRow {
  type: 'GRID';
  sections: GridSection[];
}

export interface VocabularyRow extends WorksheetRow {
  type: 'VOCABULARY';
  terms: string[];
}

export interface WorksheetConfig {
  title: string;
  showGuideLines: boolean;
  rows: WorksheetRow[];
}

export interface WorksheetViewModel {
  pages: PageView[];
  config: WorksheetConfig;
}

export interface PageView {
  pageNumber: number;
  rows: WorksheetRow[];
}
