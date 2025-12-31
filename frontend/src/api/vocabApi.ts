/**
 * Vocabulary API Layer
 *
 * Handles vocab list, tags, and linked sentences for Grammar Coach.
 */

import type { Sentence } from '../hooks/useSentences';

export interface VocabTag {
    id: number;
    name: string;
    category: string;
}

export interface VocabWithTags {
    id: number;
    word: string;
    reading: string;
    meaning: string;
    lessonId: number;
    baseForm: string;
    partOfSpeech: string;
    category: string;
    tags: VocabTag[];
    sentenceCount: number;
}

export interface VocabFilters {
    lessonId?: number;
    search?: string;
    category?: string;
}

const API_BASE = '/api/vocab';

export const vocabApi = {
    /**
     * List vocabulary with optional filters
     */
    list: async (filters?: VocabFilters): Promise<VocabWithTags[]> => {
        const params = new URLSearchParams();
        if (filters?.lessonId) params.append('lessonId', String(filters.lessonId));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.category) params.append('category', filters.category);

        const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch vocabulary');
        return response.json();
    },

    /**
     * Get single vocab by ID with full details
     */
    get: async (id: number): Promise<VocabWithTags> => {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch vocabulary');
        return response.json();
    },

    /**
     * Get tags for a vocab item
     */
    getTags: async (vocabId: number): Promise<VocabTag[]> => {
        const response = await fetch(`${API_BASE}/${vocabId}/tags`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        return response.json();
    },

    /**
     * Add tag to vocab
     */
    addTag: async (vocabId: number, tagName: string): Promise<VocabTag> => {
        const response = await fetch(`${API_BASE}/${vocabId}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tagName }),
        });
        if (!response.ok) throw new Error('Failed to add tag');
        return response.json();
    },

    /**
     * Remove tag from vocab
     */
    removeTag: async (vocabId: number, tagId: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/${vocabId}/tags/${tagId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove tag');
    },

    /**
     * Get sentences linked to a vocab item
     */
    getLinkedSentences: async (vocabId: number): Promise<Sentence[]> => {
        const response = await fetch(`${API_BASE}/${vocabId}/sentences`);
        if (!response.ok) throw new Error('Failed to fetch linked sentences');
        return response.json();
    },

    /**
     * Get available lessons for filtering
     */
    getLessons: async (): Promise<number[]> => {
        const response = await fetch(`${API_BASE}/lessons`);
        if (!response.ok) return [];
        return response.json();
    },
};
