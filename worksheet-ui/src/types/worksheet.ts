// ===== BASE TYPES =====
export type WorksheetItem =
  | HeaderItem
  | TextItem
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

export interface TextItem {
  id: string;
  type: 'TEXT';
  content: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold';
  marginTop?: string;
  marginBottom?: string;
  showPromptNumber?: boolean;
  promptNumber?: number;
  customLabel?: string;
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
  hideBorderOnContent?: boolean;  // NEW: Hide box border when box has content
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
}

export interface VocabTerm {
  id: string;
  term: string;
  meaning: string;
  listStyleOverride?: 'number' | 'letter' | 'roman' | 'bullet' | 'none' | 'vd' | 'example';

  // Per-term settings
  termType?: 'text' | 'grid';      // Default: 'text'
  gridBoxCount?: number;           // Default: 5
  showTerm?: boolean;              // Default: true
  showTrailingLine?: boolean;      // Default: true
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
}

// ===== WORKSHEET STATE =====

export interface WorksheetState {
  items: WorksheetItem[];
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
  items: WorksheetItem[];
}