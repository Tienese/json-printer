import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorksheetPage, WorksheetMetadata, WorksheetTemplate } from '../types/worksheet';

const AUTOSAVE_KEY = 'worksheet_autosave_v2';
const HISTORY_KEY = 'worksheet_history_v2';
const MAX_AUTO_SAVES = 10;
const SAVE_INTERVAL = 25 * 60 * 1000; // 25 minutes

export interface HistoryEntry {
    timestamp: string;
    // Template might be missing if it's a server-side entry not yet loaded
    template?: WorksheetTemplate;
    label?: string;
    type: 'auto' | 'manual';
    id: string; // ID is string (UUID) for local, number string for server
    isServer?: boolean;
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

    // Fetch server history when worksheetId changes
    useEffect(() => {
        if (!worksheetId) return;

        const loadServerHistory = async () => {
            try {
                const { worksheetApi } = await import('../api/worksheets');
                const serverSummaries = await worksheetApi.getHistory(worksheetId);

                const serverEntries: HistoryEntry[] = serverSummaries.map(s => ({
                    id: String(s.id),
                    timestamp: s.updatedAt,
                    type: s.type === 'SNAPSHOT' ? 'manual' : 'auto',
                    label: s.type === 'SNAPSHOT' ? s.name : undefined,
                    isServer: true,
                    // Template is undefined initially, must be fetched on click
                    template: undefined
                }));

                // Merge with local history?
                // Strategy: Display both? Or prefer Server if available?
                // Let's combine them, but filter out duplicates if possible (hard without matching IDs).
                // For now, let's just use server entries if we are in "Cloud Mode" (worksheetId exists),
                // plus any local *unsaved* entries? No, local entries might be from offline work.

                // Simpler approach: If we have a worksheetId, the Sidebar primarily shows Server history.
                // But we also want the very latest local changes in the "Local Storage" buffer.

                // Let's just append server entries to the list, sorted by date.

                setHistory(prev => {
                    // Filter out old server entries from prev to avoid duplication if we re-fetch
                    const localOnly = prev.filter(p => !p.isServer);
                    const combined = [...localOnly, ...serverEntries].sort((a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );
                    return combined;
                });

            } catch (err) {
                console.error("Failed to load server history", err);
            }
        };

        loadServerHistory();
    }, [worksheetId]);


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
        let serverId: string | undefined;
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

                const saved = await worksheetApi.autosave(worksheetId, {
                    name: metadata.title || 'Untitled Worksheet',
                    jsonContent: serialized,
                    metadata: metadataJson,
                });
                serverId = String(saved.id);
            } catch (error) {
                console.error('Server autosave failed:', error);
                // Continue with LocalStorage save even if server fails
            }
        }

        // Add to History
        try {
            // Use current state 'history' which might already have server items
            // We need to add the new entry to it.

            const newEntry: HistoryEntry = {
                id: serverId || crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                template,
                type,
                label: label || (type === 'manual' ? 'Snapshot' : undefined),
                isServer: !!serverId
            };

            setHistory(prevHistory => {
                // Prepend new entry
                let currentHistory = [newEntry, ...prevHistory];

                // Cleanup: Keep all manual, but limit autos to MAX_AUTO_SAVES
                // Note: We might want to be careful about deleting server entries from the UI view
                // if the server actually still has them.
                // But generally, the UI view should reflect the "desired" history.

                const manualSaves = currentHistory.filter(h => h.type === 'manual' || !h.type);
                let autoSaves = currentHistory.filter(h => h.type === 'auto');

                if (autoSaves.length > MAX_AUTO_SAVES) {
                    autoSaves = autoSaves.slice(0, MAX_AUTO_SAVES);
                }

                const merged = [...manualSaves, ...autoSaves].sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                // Side effect: Update storage
                // Only store LOCAL entries
                const localEntries = merged.filter(h => !h.isServer);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(localEntries));

                return merged;
            });

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
        // If it's a server entry, we might need an API call to rename it?
        // The API supports 'updateWorksheet', but snapshots/autosaves might be read-only or specific.
        // For now, let's just update local state.

        setHistory(prev => {
            const updated = prev.map(entry =>
                (entry.id === id || (!entry.id && entry.timestamp === id))
                    ? { ...entry, label: newLabel, type: 'manual' as const }
                    : entry
            );

            // Sync to local storage
            const localEntries = updated.filter(h => !h.isServer);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(localEntries));

            return updated;
        });
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
