import type { HeaderItem, TextItem, MultipleChoiceItem, TrueFalseItem, MatchingItem, ClozeItem, GridItem, VocabItem, WorksheetPage, WorksheetState } from '../types/worksheet';

export const createHeaderItem = (): HeaderItem => ({
  id: crypto.randomUUID(),
  type: 'HEADER',
  title: 'Worksheet Title',
  showName: true,
  showDate: true,
});

export const createTextItem = (): TextItem => ({
  id: crypto.randomUUID(),
  type: 'TEXT',
  content: '',
  showPromptNumber: true,
});

export const createGridItem = (): GridItem => ({
  id: crypto.randomUUID(),
  type: 'GRID',
  description: '',
  boxSize: '8mm',  // Changed from 10mm
  showFurigana: true,
  showGuides: true,
  showPromptNumber: true,
  columns: 15,
  rows: 1,
  sections: Array.from({ length: 1 }, () => ({
    id: crypto.randomUUID(),
    boxes: Array.from({ length: 1 }, () => ({ char: '', furigana: '' })),  // Changed from 15
  })),
});

export const createVocabItem = (): VocabItem => ({
  id: crypto.randomUUID(),
  type: 'VOCAB',
  columns: 1,
  fontSize: 12,
  terms: [
    { id: crypto.randomUUID(), term: 'Term 1', meaning: '' },
    { id: crypto.randomUUID(), term: 'Term 2', meaning: '' },
  ],
  description: 'Vocabulary matching exercise.',
  showPromptNumber: true,
  listStyle: 'number',
});

export const createMultipleChoiceItem = (): MultipleChoiceItem => ({
  id: crypto.randomUUID(),
  type: 'MULTIPLE_CHOICE',
  prompt: 'New multiple choice question',
  options: ['Option A', 'Option B'],
  correctIndex: 0,
  showPromptNumber: true,
});

export const createTrueFalseItem = (): TrueFalseItem => ({
  id: crypto.randomUUID(),
  type: 'TRUE_FALSE',
  prompt: 'Evaluate the following statements:',
  questions: [
    { id: crypto.randomUUID(), text: 'New statement', correctAnswer: true, showReasoning: true }
  ],
  layout: 'single',
  language: 'EN',
  showDashedLines: true,
  reasoningLines: 2,
  showPromptNumber: true,
});

export const createMatchingItem = (): MatchingItem => ({
  id: crypto.randomUUID(),
  type: 'MATCHING',
  prompt: 'Match the terms with their definitions.',
  pairs: [
    { left: 'Term 1', right: 'Definition 1' },
    { left: 'Term 2', right: 'Definition 2' },
    { left: 'Term 3', right: 'Definition 3' },
  ],
  layout: 'side-by-side',
  showPromptNumber: true,
});

export const createClozeItem = (): ClozeItem => ({
  id: crypto.randomUUID(),
  type: 'CLOZE',
  template: 'The capital of Japan is {{blank}}.',
  answers: ['Tokyo'],
  showPromptNumber: true,
});

// ===== PAGE & WORKSHEET STATE FACTORIES =====

export const createPage = (): WorksheetPage => ({
  id: crypto.randomUUID(),
  items: [],
});

export const createEmptyWorksheetState = (): WorksheetState => ({
  pages: [createPage()],
  currentPageIndex: 0,
  selectedItem: null,
  mode: 'teacher',
  metadata: {
    title: 'Untitled Worksheet',
    subject: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '2.0',  // v2 = multi-page
  },
});
