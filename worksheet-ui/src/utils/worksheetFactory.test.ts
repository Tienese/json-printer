import { describe, it, expect } from 'vitest';
import {
    createHeaderItem,
    createTextItem,
    createGridItem,
    createVocabItem,
    createMultipleChoiceItem,
    createTrueFalseItem,
    createMatchingItem,
    createClozeItem
} from './worksheetFactory';


describe('worksheetFactory', () => {
    it('should create a HeaderItem with default values', () => {
        const item = createHeaderItem();
        expect(item.type).toBe('HEADER');
        expect(item.title).toBe('Worksheet Title');
        expect(item.id).toBeDefined();
    });

    it('should create a TextItem with default values', () => {
        const item = createTextItem();
        expect(item.type).toBe('TEXT');
        expect(item.content).toBe('');
        expect(item.id).toBeDefined();
    });

    it('should create a GridItem with 15x5 dimensions', () => {
        const item = createGridItem();
        expect(item.type).toBe('GRID');
        expect(item.rows).toBe(5);
        expect(item.columns).toBe(15);
    });

    it('should create a VocabItem with default terms', () => {
        const item = createVocabItem();
        expect(item.type).toBe('VOCAB');
        expect(item.terms).toHaveLength(2);
    });

    it('should create a MultipleChoiceItem with 2 options', () => {
        const item = createMultipleChoiceItem();
        expect(item.type).toBe('MULTIPLE_CHOICE');
        expect(item.options).toHaveLength(2);
        expect(item.correctIndex).toBe(0);
    });

    it('should create a TrueFalseItem', () => {
        const item = createTrueFalseItem();
        expect(item.type).toBe('TRUE_FALSE');
        expect(item.questions).toHaveLength(1);
    });

    it('should create a MatchingItem with 3 pairs', () => {
        const item = createMatchingItem();
        expect(item.type).toBe('MATCHING');
        expect(item.pairs).toHaveLength(3);
    });

    it('should create a ClozeItem', () => {
        const item = createClozeItem();
        expect(item.type).toBe('CLOZE');
        expect(item.template).toContain('{{blank}}');
    });

    it('should generate unique IDs for items', () => {
        const item1 = createTextItem();
        const item2 = createTextItem();
        expect(item1.id).not.toBe(item2.id);
    });
});
