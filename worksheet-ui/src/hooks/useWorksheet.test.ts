import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorksheet } from './useWorksheet';
import { createTextItem } from '../utils/worksheetFactory';
import type { WorksheetItem, TextItem } from '../types/worksheet';

describe('useWorksheet', () => {
    it('should initialize with initial items', () => {
        const initialItems: WorksheetItem[] = [];
        const { result } = renderHook(() => useWorksheet(initialItems));
        expect(result.current.items).toHaveLength(0);
        expect(result.current.metadata.title).toBe('My Worksheet');
    });

    it('should add an item', () => {
        const { result } = renderHook(() => useWorksheet([]));
        const newItem = createTextItem();

        act(() => {
            result.current.addItem(newItem, 0);
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].id).toBe(newItem.id);
    });

    it('should remove an item', () => {
        const { result } = renderHook(() => useWorksheet([]));
        const newItem = createTextItem();

        act(() => {
            result.current.addItem(newItem, 0);
        });
        expect(result.current.items).toHaveLength(1);

        act(() => {
            result.current.deleteItem(newItem);
        });
        expect(result.current.items).toHaveLength(0);
    });

    it('should update an item', () => {
        const { result } = renderHook(() => useWorksheet([]));
        const newItem = createTextItem();

        act(() => {
            result.current.addItem(newItem, 0);
        });

        const updatedItem = { ...newItem, content: 'Updated Content' };
        act(() => {
            result.current.updateItem(updatedItem);
        });

        expect((result.current.items[0] as TextItem).content).toBe('Updated Content');
    });

    it('should update metadata', () => {
        const { result } = renderHook(() => useWorksheet([]));

        act(() => {
            result.current.updateMetadata({ title: 'New Title' });
        });

        expect(result.current.metadata.title).toBe('New Title');
    });

    it('should toggle view mode', () => {
        const { result } = renderHook(() => useWorksheet([]));
        expect(result.current.mode).toBe('teacher');

        act(() => {
            result.current.toggleMode();
        });
        expect(result.current.mode).toBe('student');

        act(() => {
            result.current.toggleMode();
        });
        expect(result.current.mode).toBe('teacher');
    });
});
