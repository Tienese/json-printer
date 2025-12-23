/**
 * Type guards for WorksheetItem union type.
 * Use these for type-safe narrowing instead of `as any` casts.
 */
import type {
    WorksheetItem,
    HeaderItem,
    CardItem,
    GridItem,
    VocabItem,
    MultipleChoiceItem,
    TrueFalseItem,
    MatchingItem,
    ClozeItem,
} from './worksheet';

// ===== INDIVIDUAL TYPE GUARDS =====

export function isHeaderItem(item: WorksheetItem): item is HeaderItem {
    return item.type === 'HEADER';
}

export function isCardItem(item: WorksheetItem): item is CardItem {
    return item.type === 'CARD';
}

export function isGridItem(item: WorksheetItem): item is GridItem {
    return item.type === 'GRID';
}

export function isVocabItem(item: WorksheetItem): item is VocabItem {
    return item.type === 'VOCAB';
}

export function isMultipleChoiceItem(item: WorksheetItem): item is MultipleChoiceItem {
    return item.type === 'MULTIPLE_CHOICE';
}

export function isTrueFalseItem(item: WorksheetItem): item is TrueFalseItem {
    return item.type === 'TRUE_FALSE';
}

export function isMatchingItem(item: WorksheetItem): item is MatchingItem {
    return item.type === 'MATCHING';
}

export function isClozeItem(item: WorksheetItem): item is ClozeItem {
    return item.type === 'CLOZE';
}

// ===== CATEGORY TYPE GUARDS =====

/** Content items: Header, Card, Grid, Vocab */
export function isContentItem(item: WorksheetItem): item is HeaderItem | CardItem | GridItem | VocabItem {
    return ['HEADER', 'CARD', 'GRID', 'VOCAB'].includes(item.type);
}

/** Question items: MultipleChoice, TrueFalse, Matching, Cloze */
export function isQuestionItem(item: WorksheetItem): item is MultipleChoiceItem | TrueFalseItem | MatchingItem | ClozeItem {
    return ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'MATCHING', 'CLOZE'].includes(item.type);
}

/** Items that can have a prompt number */
export function hasPromptNumber(item: WorksheetItem): item is WorksheetItem & { showPromptNumber?: boolean; promptNumber?: number } {
    return 'showPromptNumber' in item;
}

// ===== ITEM TYPE LABELS =====

export const ITEM_TYPE_LABELS: Record<WorksheetItem['type'], string> = {
    HEADER: 'Header',
    CARD: 'Card Block',
    GRID: 'Writing Grid',
    VOCAB: 'Vocabulary',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TRUE_FALSE: 'True/False',
    MATCHING: 'Matching',
    CLOZE: 'Fill-in-the-Blank',
};

export function getItemTypeLabel(item: WorksheetItem): string {
    return ITEM_TYPE_LABELS[item.type] || item.type;
}
