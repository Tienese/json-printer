/**
 * Factory functions to create default rows
 */

import type {
  RowType,
  HeaderRow,
  TextRow,
  GridRow,
  VocabularyRow,
  WorksheetRow,
  CharacterBox,
  GridSection,
  VocabTerm,
} from '../types/worksheet';
import {
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_GRID_BOX_COUNT,
  DEFAULT_BOX_SIZE,
  DEFAULT_VOCAB_COLUMNS,
  DEFAULT_VOCAB_LINE_STYLE,
} from './constants';

let idCounter = 0;

export function generateId(prefix = 'row'): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

export function createCharacterBox(): CharacterBox {
  return {
    id: generateId('box'),
    furigana: '',
    text: '',
  };
}

export function createGridSection(
  boxCount = DEFAULT_GRID_BOX_COUNT
): GridSection {
  return {
    id: generateId('section'),
    boxSize: DEFAULT_BOX_SIZE,
    boxes: Array.from({ length: boxCount }, () => createCharacterBox()),
    showGuides: true,
  };
}

export function createVocabTerm(): VocabTerm {
  return {
    id: generateId('term'),
    term: '',
    meaning: '',
  };
}

export function createHeaderRow(order: number): HeaderRow {
  return {
    id: generateId('row'),
    type: 'HEADER',
    order,
    showDate: true,
    showName: true,
    title: '',
  };
}

export function createTextRow(order: number): TextRow {
  return {
    id: generateId('row'),
    type: 'TEXT',
    order,
    content: '',
    fontSize: DEFAULT_TEXT_FONT_SIZE,
    bold: false,
    alignment: 'left',
  };
}

export function createGridRow(order: number): GridRow {
  return {
    id: generateId('row'),
    type: 'GRID',
    order,
    sections: [createGridSection()],
  };
}

export function createVocabularyRow(order: number): VocabularyRow {
  return {
    id: generateId('row'),
    type: 'VOCABULARY',
    order,
    terms: [createVocabTerm()],
    columns: DEFAULT_VOCAB_COLUMNS,
    lineStyle: DEFAULT_VOCAB_LINE_STYLE,
  };
}

export function createRow(type: RowType, order: number): WorksheetRow {
  switch (type) {
    case 'HEADER':
      return createHeaderRow(order);
    case 'TEXT':
      return createTextRow(order);
    case 'GRID':
      return createGridRow(order);
    case 'VOCABULARY':
      return createVocabularyRow(order);
  }
}
