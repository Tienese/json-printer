/**
 * Default settings for the worksheet builder.
 * These values are used when no user override exists.
 * 
 * Settings follow a VS Code-style naming convention:
 * - category.subcategory.property
 */

export const DEFAULT_SETTINGS = {
    // ===== GRID SETTINGS =====
    'grid.boxSize': '10mm',
    'grid.showFurigana': true,
    'grid.furiganaFontSize': '6pt',
    'grid.alignment': 'left',
    'grid.showGuides': false,
    'grid.hideBorderOnContent': false,

    // ===== CARD SETTINGS =====
    'card.showBorder': true,
    'card.borderStyle': 'solid',
    'card.fontSize': '12pt',
    'card.language': 'VI',
    'card.cardStyle': 'note',

    // ===== VOCAB SETTINGS =====
    'vocab.columns': 1,
    'vocab.fontSize': 11,
    'vocab.listStyle': 'number',
    'vocab.gridBoxSize': '10mm',
    'vocab.gridLayout': 'inline',
    'vocab.gridShowFurigana': false,

    // ===== MULTIPLE CHOICE SETTINGS =====
    'multipleChoice.columns': 1,
    'multipleChoice.shuffleOptions': false,

    // ===== TRUE/FALSE SETTINGS =====
    'trueFalse.language': 'EN',
    'trueFalse.showDashedLines': true,
    'trueFalse.reasoningLines': 2,
    'trueFalse.layout': 'single',

    // ===== MATCHING SETTINGS =====
    'matching.layout': 'side-by-side',
    'matching.shuffleRight': true,

    // ===== CLOZE SETTINGS =====
    'cloze.blankWidth': '3cm',

    // ===== PRINT SETTINGS =====
    'print.pageSize': 'A4',
    'print.margin': '1.27cm',
    'print.showPageNumbers': false,
    'print.headerHeight': 'auto',

    // ===== QUIZ REPORT SETTINGS =====
    'quiz.report.showStudentName': true,
    'quiz.report.showScore': true,
    'quiz.report.showDate': true,
    'quiz.report.fontSize': '11pt',

    // ===== EDITOR SETTINGS =====
    'editor.autoSaveInterval': 30000,
    'editor.showAiLogs': false,
    'editor.defaultZoom': 1,

} as const;

// Type for settings keys
export type SettingsKey = keyof typeof DEFAULT_SETTINGS;

// Type for settings values
export type SettingsValue<K extends SettingsKey> = typeof DEFAULT_SETTINGS[K];

// Type for the full settings object
export type Settings = typeof DEFAULT_SETTINGS;

// Type for user overrides (partial settings)
export type UserSettings = Partial<Settings>;

/**
 * Get a setting description for UI display.
 */
export const SETTINGS_DESCRIPTIONS: Partial<Record<SettingsKey, string>> = {
    'grid.boxSize': 'Size of each character box in the writing grid',
    'grid.showFurigana': 'Show furigana input row above main characters',
    'grid.alignment': 'Horizontal alignment of grid content',
    'card.showBorder': 'Show border around card blocks',
    'card.borderStyle': 'Border style for card blocks',
    'vocab.listStyle': 'Numbering style for vocabulary terms',
    'trueFalse.showDashedLines': 'Show dashed lines for student reasoning',
    'print.margin': 'Page margin for printing',
    'editor.autoSaveInterval': 'Auto-save interval in milliseconds',
};

/**
 * Get settings grouped by category for UI display.
 */
export function getSettingsByCategory() {
    const categories: Record<string, { key: SettingsKey; value: unknown }[]> = {};

    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingsKey[]) {
        const category = key.split('.')[0];
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push({ key, value: DEFAULT_SETTINGS[key] });
    }

    return categories;
}
