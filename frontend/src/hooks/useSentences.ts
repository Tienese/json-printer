import { useState, useCallback } from 'react';

/**
 * API types for sentences
 */
export interface Sentence {
    id: number;
    text: string;
    lessonId: number | null;
    expectedValid: boolean;
    validationStatus: string;
    validationMessage: string | null;
    notes: string | null;
    source: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SentenceVocabLink {
    id: number;
    sentenceId: number;
    vocabId: number;
    position: number | null;
    detectedSlot: string | null;
    particle: string | null;
}

export interface CreateSentenceRequest {
    text: string;
    lessonId?: number;
    expectedValid?: boolean;
    notes?: string;
}

const API_BASE = '/api/sentences';

/**
 * Hook for sentence CRUD and validation operations.
 */
export function useSentences() {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async (lessonId?: number, status?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (lessonId) params.set('lessonId', String(lessonId));
            if (status) params.set('status', status);

            const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch sentences');
            const data = await res.json();
            setSentences(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (request: CreateSentenceRequest): Promise<Sentence | null> => {
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to create sentence');
            return await res.json();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        }
    }, []);

    const update = useCallback(async (id: number, request: Partial<CreateSentenceRequest>): Promise<Sentence | null> => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to update sentence');
            return await res.json();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        }
    }, []);

    const remove = useCallback(async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            return res.ok;
        } catch {
            return false;
        }
    }, []);

    const validate = useCallback(async (id: number): Promise<Sentence | null> => {
        try {
            const res = await fetch(`${API_BASE}/${id}/validate`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to validate sentence');
            return await res.json();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        }
    }, []);

    const validateAll = useCallback(async (): Promise<number> => {
        try {
            const res = await fetch(`${API_BASE}/validate-all`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to validate all');
            const data = await res.json();
            return data.validated || 0;
        } catch {
            return 0;
        }
    }, []);

    const autoLink = useCallback(async (id: number): Promise<SentenceVocabLink[]> => {
        try {
            const res = await fetch(`${API_BASE}/${id}/auto-link`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to auto-link');
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    return {
        sentences,
        loading,
        error,
        fetchAll,
        create,
        update,
        remove,
        validate,
        validateAll,
        autoLink,
    };
}
