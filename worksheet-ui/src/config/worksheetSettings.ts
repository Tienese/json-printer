/**
 * Worksheet Builder Settings Schema
 * 
 * VS Code-style configuration for all worksheet builder options.
 * These settings control default values when creating new elements.
 */

// Type definitions for settings
export interface WorksheetSettings {
  // ===== GRID BOX =====
  "worksheet.grid.boxSize": "8mm" | "10mm" | "12mm";
  "worksheet.grid.showFurigana": boolean;
  "worksheet.grid.showGuides": boolean;
  "worksheet.grid.hideBorderOnContent": boolean;
  "worksheet.grid.defaultColumns": number;
  "worksheet.grid.defaultRows": number;

  // ===== VOCABULARY =====
  "worksheet.vocab.columns": number;
  "worksheet.vocab.fontSize": number;
  "worksheet.vocab.listStyle": "number" | "letter" | "roman" | "bullet" | "none" | "vd" | "example";
  "worksheet.vocab.gridBoxSize": "8mm" | "10mm" | "12mm";
  "worksheet.vocab.gridLayout": "inline" | "below";
  "worksheet.vocab.showFurigana": boolean;

  // ===== CARD (TEXT BLOCK) =====
  "worksheet.card.fontSize": string;
  "worksheet.card.textAlign": "left" | "center" | "right" | "justify";
  "worksheet.card.showBorder": boolean;
  "worksheet.card.borderStyle": "solid" | "double" | "dashed";
  "worksheet.card.language": "VI" | "EN" | "JP";

  // ===== HEADER =====
  "worksheet.header.fontSize": string;
  "worksheet.header.textAlign": "left" | "center" | "right";
  "worksheet.header.fontWeight": "normal" | "bold";
  "worksheet.header.showName": boolean;
  "worksheet.header.showDate": boolean;

  // ===== MULTIPLE CHOICE =====
  "worksheet.multipleChoice.columns": number;
  "worksheet.multipleChoice.defaultOptionCount": number;

  // ===== TRUE/FALSE =====
  "worksheet.trueFalse.layout": "single" | "multiple";
  "worksheet.trueFalse.language": "EN" | "VN" | "JP";
  "worksheet.trueFalse.showDashedLines": boolean;
  "worksheet.trueFalse.reasoningLines": number;

  // ===== MATCHING =====
  "worksheet.matching.layout": "side-by-side" | "scrambled";
  "worksheet.matching.defaultPairCount": number;

  // ===== CLOZE =====
  "worksheet.cloze.blankWidth": string;

  // ===== GENERAL =====
  "worksheet.general.showPromptNumbers": boolean;
  "worksheet.general.defaultViewMode": "student" | "teacher";
  "worksheet.general.autoSaveInterval": number;

  // ===== ANALYSIS (VOCAB COACH) =====
  "worksheet.analysis.defaultLessonId": number;
  "worksheet.analysis.autoAnalyzeOnSave": boolean;
}

// Default settings
export const DEFAULT_SETTINGS: WorksheetSettings = {
  // Grid Box
  "worksheet.grid.boxSize": "8mm",
  "worksheet.grid.showFurigana": true,
  "worksheet.grid.showGuides": true,
  "worksheet.grid.hideBorderOnContent": false,
  "worksheet.grid.defaultColumns": 15,
  "worksheet.grid.defaultRows": 1,

  // Vocabulary
  "worksheet.vocab.columns": 1,
  "worksheet.vocab.fontSize": 12,
  "worksheet.vocab.listStyle": "number",
  "worksheet.vocab.gridBoxSize": "10mm",
  "worksheet.vocab.gridLayout": "inline",
  "worksheet.vocab.showFurigana": false,

  // Card
  "worksheet.card.fontSize": "14px",
  "worksheet.card.textAlign": "left",
  "worksheet.card.showBorder": false,
  "worksheet.card.borderStyle": "solid",
  "worksheet.card.language": "VI",

  // Header
  "worksheet.header.fontSize": "24px",
  "worksheet.header.textAlign": "center",
  "worksheet.header.fontWeight": "bold",
  "worksheet.header.showName": true,
  "worksheet.header.showDate": true,

  // Multiple Choice
  "worksheet.multipleChoice.columns": 1,
  "worksheet.multipleChoice.defaultOptionCount": 4,

  // True/False
  "worksheet.trueFalse.layout": "single",
  "worksheet.trueFalse.language": "EN",
  "worksheet.trueFalse.showDashedLines": true,
  "worksheet.trueFalse.reasoningLines": 2,

  // Matching
  "worksheet.matching.layout": "side-by-side",
  "worksheet.matching.defaultPairCount": 3,

  // Cloze
  "worksheet.cloze.blankWidth": "80px",

  // General
  "worksheet.general.showPromptNumbers": true,
  "worksheet.general.defaultViewMode": "teacher",
  "worksheet.general.autoSaveInterval": 30000,

  // Analysis
  "worksheet.analysis.defaultLessonId": 1,
  "worksheet.analysis.autoAnalyzeOnSave": false,
};

// Settings metadata for UI rendering
export interface SettingMeta {
  key: keyof WorksheetSettings;
  label: string;
  description: string;
  type: "boolean" | "number" | "string" | "select";
  options?: string[];
  category: string;
  min?: number;
  max?: number;
}

export const SETTINGS_SCHEMA: SettingMeta[] = [
  // Grid Box Settings
  {
    key: "worksheet.grid.boxSize",
    label: "Box Size",
    description: "Default size for grid boxes",
    type: "select",
    options: ["8mm", "10mm", "12mm"],
    category: "Grid Box",
  },
  {
    key: "worksheet.grid.showFurigana",
    label: "Show Furigana",
    description: "Display furigana space above grid boxes",
    type: "boolean",
    category: "Grid Box",
  },
  {
    key: "worksheet.grid.showGuides",
    label: "Show Guides",
    description: "Display cross-hair guides in grid boxes",
    type: "boolean",
    category: "Grid Box",
  },
  {
    key: "worksheet.grid.hideBorderOnContent",
    label: "Hide Border on Content",
    description: "Hide box border when character is entered",
    type: "boolean",
    category: "Grid Box",
  },
  {
    key: "worksheet.grid.defaultColumns",
    label: "Default Columns",
    description: "Number of columns per row",
    type: "number",
    min: 1,
    max: 20,
    category: "Grid Box",
  },

  // Vocabulary Settings
  {
    key: "worksheet.vocab.columns",
    label: "Columns",
    description: "Number of columns for vocabulary layout",
    type: "number",
    min: 1,
    max: 4,
    category: "Vocabulary",
  },
  {
    key: "worksheet.vocab.fontSize",
    label: "Font Size",
    description: "Font size in pixels",
    type: "number",
    min: 10,
    max: 24,
    category: "Vocabulary",
  },
  {
    key: "worksheet.vocab.listStyle",
    label: "List Style",
    description: "Numbering style for vocabulary items",
    type: "select",
    options: ["number", "letter", "roman", "bullet", "none", "vd", "example"],
    category: "Vocabulary",
  },

  // Card Settings
  {
    key: "worksheet.card.fontSize",
    label: "Font Size",
    description: "Default font size for text blocks",
    type: "string",
    category: "Card",
  },
  {
    key: "worksheet.card.textAlign",
    label: "Text Align",
    description: "Default text alignment",
    type: "select",
    options: ["left", "center", "right", "justify"],
    category: "Card",
  },
  {
    key: "worksheet.card.language",
    label: "Language",
    description: "Default language for text blocks",
    type: "select",
    options: ["VI", "EN", "JP"],
    category: "Card",
  },
  {
    key: "worksheet.card.showBorder",
    label: "Show Border",
    description: "Display border around card",
    type: "boolean",
    category: "Card",
  },

  // True/False Settings
  {
    key: "worksheet.trueFalse.layout",
    label: "Layout",
    description: "Question layout style",
    type: "select",
    options: ["single", "multiple"],
    category: "True/False",
  },
  {
    key: "worksheet.trueFalse.language",
    label: "Language",
    description: "Language for True/False labels",
    type: "select",
    options: ["EN", "VN", "JP"],
    category: "True/False",
  },
  {
    key: "worksheet.trueFalse.showDashedLines",
    label: "Show Dashed Lines",
    description: "Display dashed lines for reasoning",
    type: "boolean",
    category: "True/False",
  },
  {
    key: "worksheet.trueFalse.reasoningLines",
    label: "Reasoning Lines",
    description: "Number of lines for student reasoning",
    type: "number",
    min: 0,
    max: 5,
    category: "True/False",
  },

  // Matching Settings
  {
    key: "worksheet.matching.layout",
    label: "Layout",
    description: "Matching question layout",
    type: "select",
    options: ["side-by-side", "scrambled"],
    category: "Matching",
  },
  {
    key: "worksheet.matching.defaultPairCount",
    label: "Default Pair Count",
    description: "Initial number of matching pairs",
    type: "number",
    min: 2,
    max: 10,
    category: "Matching",
  },

  // General Settings
  {
    key: "worksheet.general.showPromptNumbers",
    label: "Show Prompt Numbers",
    description: "Display question numbers by default",
    type: "boolean",
    category: "General",
  },
  {
    key: "worksheet.general.defaultViewMode",
    label: "Default View Mode",
    description: "Initial view mode when opening editor",
    type: "select",
    options: ["student", "teacher"],
    category: "General",
  },
  {
    key: "worksheet.general.autoSaveInterval",
    label: "Auto-Save Interval",
    description: "Time between auto-saves in milliseconds",
    type: "number",
    min: 10000,
    max: 300000,
    category: "General",
  },

  // Analysis Settings
  {
    key: "worksheet.analysis.defaultLessonId",
    label: "Default Lesson",
    description: "Default lesson for vocabulary analysis",
    type: "number",
    min: 1,
    max: 50,
    category: "Vocab Coach",
  },
  {
    key: "worksheet.analysis.autoAnalyzeOnSave",
    label: "Auto-Analyze on Save",
    description: "Run vocabulary analysis when saving to cloud",
    type: "boolean",
    category: "Vocab Coach",
  },
];

// Group settings by category
export function getSettingsByCategory(): Map<string, SettingMeta[]> {
  const grouped = new Map<string, SettingMeta[]>();
  
  for (const setting of SETTINGS_SCHEMA) {
    const existing = grouped.get(setting.category) || [];
    existing.push(setting);
    grouped.set(setting.category, existing);
  }
  
  return grouped;
}
