/**
 * useVocabManagement Hook
 *
 * Manages vocabulary list, detail, tags, and linked sentences for Grammar Coach.
 */

import { useState, useCallback } from 'react';
import { vocabApi, type VocabWithTags, type VocabTag, type VocabFilters } from '../api/vocabApi';
import type { Sentence } from './useSentences';

export function useVocabManagement() {
    const [vocabList, setVocabList] = useState<VocabWithTags[]>([]);
    const [selectedVocab, setSelectedVocab] = useState<VocabWithTags | null>(null);
    const [linkedSentences, setLinkedSentences] = useState<Sentence[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch vocabulary list with filters
     */
    const fetchVocabList = useCallback(async (filters?: VocabFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await vocabApi.list(filters);
            setVocabList(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch vocabulary');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Select a vocab item and load its details + linked sentences
     */
    const selectVocab = useCallback(async (vocab: VocabWithTags | null) => {
        setSelectedVocab(vocab);
        if (vocab) {
            try {
                const sentences = await vocabApi.getLinkedSentences(vocab.id);
                setLinkedSentences(sentences);
            } catch {
                setLinkedSentences([]);
            }
        } else {
            setLinkedSentences([]);
        }
    }, []);

    /**
     * Add tag to selected vocab
     */
    const addTag = useCallback(async (tagName: string): Promise<boolean> => {
        if (!selectedVocab) return false;
        try {
            const newTag = await vocabApi.addTag(selectedVocab.id, tagName);
            setSelectedVocab(prev => prev ? {
                ...prev,
                tags: [...prev.tags, newTag],
            } : null);
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add tag');
            return false;
        }
    }, [selectedVocab]);

    /**
     * Remove tag from selected vocab
     */
    const removeTag = useCallback(async (tagId: number): Promise<boolean> => {
        if (!selectedVocab) return false;
        try {
            await vocabApi.removeTag(selectedVocab.id, tagId);
            setSelectedVocab(prev => prev ? {
                ...prev,
                tags: prev.tags.filter(t => t.id !== tagId),
            } : null);
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to remove tag');
            return false;
        }
    }, [selectedVocab]);

    /**
     * Refresh linked sentences for selected vocab
     */
    const refreshLinkedSentences = useCallback(async () => {
        if (!selectedVocab) return;
        try {
            const sentences = await vocabApi.getLinkedSentences(selectedVocab.id);
            setLinkedSentences(sentences);
        } catch {
            // Silent fail
        }
    }, [selectedVocab]);

    return {
        vocabList,
        selectedVocab,
        linkedSentences,
        loading,
        error,
        fetchVocabList,
        selectVocab,
        addTag,
        removeTag,
        refreshLinkedSentences,
        setError,
    };
}

export type { VocabWithTags, VocabTag, VocabFilters };
