import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToLocalStorage, loadFromLocalStorage, saveWorksheetToFile } from './worksheetStorage';
import type { WorksheetTemplate } from '../types/worksheet';

describe('worksheetStorage', () => {
    const mockState: WorksheetTemplate = {
        metadata: {
            title: 'Test Worksheet',
            subject: 'Test',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0'
        },
        pages: [
            {
                id: 'page-1',
                items: [
                    { id: '1', type: 'HEADER', title: 'Header', showName: true, showDate: true }
                ]
            }
        ]
    };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        // Mock URL.createObjectURL and URL.revokeObjectURL
        if (typeof window.URL.createObjectURL === 'undefined') {
            window.URL.createObjectURL = vi.fn(() => 'mock-url');
        }
        if (typeof window.URL.revokeObjectURL === 'undefined') {
            window.URL.revokeObjectURL = vi.fn();
        }
    });

    it('should save and load from local storage', () => {
        saveToLocalStorage(mockState);
        const loaded = loadFromLocalStorage();
        expect(loaded).toEqual(mockState);
    });

    it('should trigger file download in saveWorksheetToFile', () => {
        const spyCreateElement = vi.spyOn(document, 'createElement');
        const spyURLCreate = vi.spyOn(URL, 'createObjectURL');

        // Mock link.click to prevent actual navigation/download
        const mockLink = {
            click: vi.fn(),
            setAttribute: vi.fn(),
            style: {},
            href: '',
            download: ''
        };
        spyCreateElement.mockReturnValue(mockLink as any);

        saveWorksheetToFile(mockState);

        expect(spyCreateElement).toHaveBeenCalledWith('a');
        expect(spyURLCreate).toHaveBeenCalled();
        expect(mockLink.click).toHaveBeenCalled();
    });
});
