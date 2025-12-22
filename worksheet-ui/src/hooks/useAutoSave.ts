import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorksheetPage, WorksheetMetadata, WorksheetTemplate } from '../types/worksheet';

const AUTOSAVE_KEY = 'worksheet_autosave_v2';
const HISTORY_KEY = 'worksheet_history_v2';
const MAX_AUTO_SAVES = 10;
const SAVE_INTERVAL = 25 * 60 * 1000; // 25 minutes

export interface HistoryEntry {
    timestamp: string;
    template: WorksheetTemplate;
    label?: string;
    type: 'auto' | 'manual';
    id: string;
}

/**
 * Multi-page aware autosave hook.
 * Saves pages array instead of flat items.
 * If worksheetId is provided, also saves to server.
 */
export function useAutoSave(
    pages: WorksheetPage[],
    metadata: WorksheetMetadata,
    worksheetId?: number | null
) {
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const lastSavedRef = useRef<string>('');
    const hasSavedInBackgroundRef = useRef(false);

    const updateHistoryStorage = (newHistory: HistoryEntry[]) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            setHistory(newHistory);
        } catch (err) {
            console.error("Failed to update history storage:", err);
        }
    };

    const performSave = useCallback(async (type: 'auto' | 'manual' = 'auto', label?: string) => {
        // Check if there's content to save
        const totalItems = pages.reduce((sum, p) => sum + p.items.length, 0);
        if (totalItems === 0 && !metadata.subject) return;

        const template: WorksheetTemplate = { metadata, pages };
        const serialized = JSON.stringify(template);

        // For auto-saves, avoid redundant saves
        if (type === 'auto' && serialized === lastSavedRef.current) return;

        // Save current state as the primary autosave (LocalStorage)
        localStorage.setItem(AUTOSAVE_KEY, serialized);
        lastSavedRef.current = serialized;

        // Save to server if worksheetId exists
        if (worksheetId && type === 'auto') {
            try {
                const { worksheetApi } = await import('../api/worksheets');
                const allItems = pages.flatMap(p => p.items);
                const metadataJson = JSON.stringify({
                    gridCount: allItems.filter(i => i.type === 'GRID').length,
                    vocabCount: allItems.filter(i => i.type === 'VOCAB').length,
                    textCount: allItems.filter(i => i.type === 'CARD').length,
                    mcCount: allItems.filter(i => i.type === 'MULTIPLE_CHOICE').length,
                    tfCount: allItems.filter(i => i.type === 'TRUE_FALSE').length,
                    matchingCount: allItems.filter(i => i.type === 'MATCHING').length,
                    clozeCount: allItems.filter(i => i.type === 'CLOZE').length,
                });

                await worksheetApi.autosave(worksheetId, {
                    name: metadata.title || 'Untitled Worksheet',
                    jsonContent: serialized,
                    metadata: metadataJson,
                });
            } catch (error) {
                console.error('Server autosave failed:', error);
                // Continue with LocalStorage save even if server fails
            }
        }

        // Add to History
        try {
            const historyJson = localStorage.getItem(HISTORY_KEY);
            let currentHistory: HistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];

            // Add new entry
            const newEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                template,
                type,
                label: label || (type === 'manual' ? 'Snapshot' : undefined)
            };

            // Prepend new entry
            currentHistory = [newEntry, ...currentHistory];

            // Cleanup: Keep all manual, but limit autos to MAX_AUTO_SAVES
            const manualSaves = currentHistory.filter(h => h.type === 'manual' || !h.type);
            let autoSaves = currentHistory.filter(h => h.type === 'auto');

            if (autoSaves.length > MAX_AUTO_SAVES) {
                autoSaves = autoSaves.slice(0, MAX_AUTO_SAVES);
            }

            const merged = [...manualSaves, ...autoSaves].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            updateHistoryStorage(merged);
        } catch (err) {
            console.error("Failed to update history:", err);
        }
    }, [pages, metadata, worksheetId]);

    // Time-based Trigger (25 min when focused, once on blur)
    useEffect(() => {
        const intervalId = setInterval(() => {
            const isDocumentHidden = document.hidden;

            if (isDocumentHidden) {
                // Background Logic: Save ONCE
                if (!hasSavedInBackgroundRef.current) {
                    void performSave('auto');
                    hasSavedInBackgroundRef.current = true;
                }
            } else {
                // Foreground Logic: Always save (if changed)
                void performSave('auto');
                hasSavedInBackgroundRef.current = false;
            }
        }, SAVE_INTERVAL);

        return () => clearInterval(intervalId);
    }, [performSave]);

    const renameHistoryEntry = (id: string, newLabel: string) => {
        const updatedHistory = history.map(entry =>
            (entry.id === id || (!entry.id && entry.timestamp === id))
                ? { ...entry, label: newLabel, type: 'manual' as const }
                : entry
        );
        updateHistoryStorage(updatedHistory);
    };

    const triggerManualSave = () => {
        void performSave('manual', 'Manual Save');
    };

    const getAutosave = (): WorksheetTemplate | null => {
        try {
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    };

    const clearAutosave = () => {
        localStorage.removeItem(AUTOSAVE_KEY);
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
    };

    return {
        getAutosave,
        history,
        renameHistoryEntry,
        triggerManualSave,
        clearAutosave
    };
}
