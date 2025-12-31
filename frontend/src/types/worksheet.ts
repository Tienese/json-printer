// ===== BASE TYPES =====
export type WorksheetItem =
  | HeaderItem
  | CardItem
  | GridItem
  | VocabItem
  | MultipleChoiceItem
  | TrueFalseItem
  | MatchingItem
  | ClozeItem;

export type ViewMode = 'student' | 'teacher';

// ===== EXISTING TYPES (unchanged) =====
export interface HeaderItem {
  id: string;
  type: 'HEADER';
  title: string;
  showName: boolean;
  showDate: boolean;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  marginTop?: string;
  marginBottom?: string;
  customLabel?: string;
}

export interface CardItem {
  id: string;
  type: 'CARD';
  content: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold';
  marginTop?: string;
  marginBottom?: string;
  showPromptNumber?: boolean;
  promptNumber?: number;
  customLabel?: string;

  // Card-specific styling (B&W print-friendly)
  showBorder?: boolean;
  borderStyle?: 'solid' | 'double' | 'dashed';
  cardHeader?: string;
  cardStyle?: 'note' | 'info' | 'warning';
  language?: 'VI' | 'EN' | 'JP';  // Default: VI (Vietnamese)
  columns?: number;               // Default: 1 (single column)
}

export interface GridItem {
  id: string;
  type: 'GRID';
  description: string;
  showPromptNumber: boolean;
  promptNumber?: number;
  boxSize: '8mm' | '10mm' | '12mm';
  showFurigana: boolean;
  showGuides: boolean;
  hideBorderOnContent?: boolean;  // Hide box border when box has content
  alignment?: 'left' | 'center' | 'right';  // Grid alignment
  furiganaFontSize?: string;  // Furigana text font size, e.g. '6pt'
  columns: number;
  rows: number;
  sections: GridSection[];
  customLabel?: string;
}

export interface GridSection {
  id: string;
  boxes: CharacterBox[];
}

export interface CharacterBox {
  char: string;
  furigana: string;
}

export interface VocabItem {
  id: string;
  type: 'VOCAB';
  columns: number;
  fontSize: number;
  terms: VocabTerm[];
  description?: string;
  showDescription?: boolean;
  showPromptNumber?: boolean;
  promptNumber?: number;
  listStyle?: 'number' | 'letter' | 'roman' | 'bullet' | 'none' | 'vd' | 'example';
  customLabel?: string;

  // Global grid settings
  gridBoxSize?: '8mm' | '10mm' | '12mm';  // Default: 10mm
  gridLayout?: 'inline' | 'below';         // Default: inline
  gridShowFurigana?: boolean;              // Default: false
  gridShowGuides?: boolean;                // Default: false - inner crosshair guides
}

export interface VocabTerm {
  id: string;
  term: string;
  meaning: string;
  listStyleOverride?: 'number' | 'letter' | 'roman' | 'bullet' | 'none' | 'vd' | 'example';

  // Per-term settings
  termType?: 'text' | 'grid';      // Default: 'text'
  gridBoxCount?: number;           // Default: 5
  gridBoxes?: CharacterBox[];      // Character data for grid mode
  showTerm?: boolean;              // Default: true
  showTrailingLine?: boolean;      // Default: true
  termLayout?: 'inline' | 'below'; // Default: 'inline' - term position relative to line
}

// ===== NEW QUESTION TYPES =====

export interface MultipleChoiceItem {
  id: string;
  type: 'MULTIPLE_CHOICE';
  prompt: string;
  options: string[];
  correctIndex: number;
  showPromptNumber: boolean;
  promptNumber?: number;
  columns?: number;
  customLabel?: string;
}

export interface TrueFalseItem {
  id: string;
  type: 'TRUE_FALSE';
  prompt: string;
  questions: TrueFalseQuestion[];
  layout: 'single' | 'multiple';
  language: 'EN' | 'VN' | 'JP';
  showDashedLines: boolean;
  reasoningLines: number;
  showPromptNumber: boolean;
  promptNumber?: number;
  customLabel?: string;
}

export interface TrueFalseQuestion {
  id: string;
  text: string;
  correctAnswer: boolean;
  showReasoning: boolean;
}

export interface MatchingItem {
  id: string;
  type: 'MATCHING';
  prompt: string;
  pairs: MatchPair[];
  layout: 'side-by-side' | 'scrambled';
  showPromptNumber: boolean;
  promptNumber?: number;
  customLabel?: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface ClozeItem {
  id: string;
  type: 'CLOZE';
  template: string;
  answers: string[];
  showPromptNumber: boolean;
  promptNumber?: number;
  blankWidth?: string;
  customLabel?: string;
  listStyle?: 'number' | 'letter' | 'roman' | 'bullet' | 'none'; // Bullet style for multi-line cloze
}

// ===== WORKSHEET STATE =====

/**
 * A single page in the worksheet.
 * Each page contains its own items and renders as a separate A4 page when printed.
 */
export interface WorksheetPage {
  id: string;
  items: WorksheetItem[];
}

export interface WorksheetState {
  pages: WorksheetPage[];        // Array of pages (each page has its own items)
  currentPageIndex: number;      // Currently active page (0-indexed)
  selectedItem: WorksheetItem | null;
  mode: ViewMode;
  metadata: WorksheetMetadata;
}

export interface WorksheetMetadata {
  title: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// ===== SAVE/LOAD SCHEMA =====

export interface WorksheetTemplate {
  metadata: WorksheetMetadata;
  pages: WorksheetPage[];        // Templates also use pages array
}

// Legacy support: convert old flat items to pages
export function migrateToPages(items: WorksheetItem[]): WorksheetPage[] {
  return [{ id: crypto.randomUUID(), items }];
}