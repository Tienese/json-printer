import { useState, useCallback } from 'react';

/**
 * API types for grammar rules
 */
export interface GrammarRuleV4 {
    id: number;
    name: string;
    ruleType: string;
    particle: string | null;
    pattern: string | null;
    lessonId: number | null;
    description: string | null;
    isActive: boolean;
    parentRuleId: number | null;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

export interface RuleCondition {
    id: number;
    ruleId: number;
    conditionOrder: number;
    targetPosition: string;
    conditionType: string;
    conditionValue: string;
    errorMessage: string | null;
    isRequired: boolean;
    isNegated: boolean;
    targetSlot: string | null;
}

export interface RuleTestSentence {
    id: number;
    ruleId: number;
    text: string;
    expectedResult: string;
    actualResult: string | null;
    resultMatches: boolean | null;
    sentenceId: number | null;
}

export interface CreateRuleRequest {
    name: string;
    ruleType: string;
    particle?: string;
    pattern?: string;
    lessonId?: number;
    description?: string;
}

export interface CreateConditionRequest {
    targetPosition: string;
    conditionType: string;
    conditionValue: string;
    errorMessage?: string;
    isRequired?: boolean;
}

export interface CreateTestSentenceRequest {
    text: string;
    expectedResult: string;
}

const API_BASE = '/api/grammar-rules-v4';

/**
 * Hook for grammar rule CRUD and condition management.
 */
export function useGrammarRules() {
    const [rules, setRules] = useState<GrammarRuleV4[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async (type?: string, particle?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (type) params.set('type', type);
            if (particle) params.set('particle', particle);

            const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch rules');
            const data = await res.json();
            setRules(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (request: CreateRuleRequest): Promise<GrammarRuleV4 | null> => {
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to create rule');
            return await res.json();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        }
    }, []);

    const update = useCallback(async (id: number, request: Partial<CreateRuleRequest>): Promise<GrammarRuleV4 | null> => {
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to update rule');
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

    // Conditions
    const getConditions = useCallback(async (ruleId: number): Promise<RuleCondition[]> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/conditions`);
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    const addCondition = useCallback(async (ruleId: number, request: CreateConditionRequest): Promise<RuleCondition | null> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/conditions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to add condition');
            return await res.json();
        } catch {
            return null;
        }
    }, []);

    const removeCondition = useCallback(async (ruleId: number, conditionId: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/conditions/${conditionId}`, { method: 'DELETE' });
            return res.ok;
        } catch {
            return false;
        }
    }, []);

    // Test sentences
    const getTestSentences = useCallback(async (ruleId: number): Promise<RuleTestSentence[]> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/test-sentences`);
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    const addTestSentence = useCallback(async (ruleId: number, request: CreateTestSentenceRequest): Promise<RuleTestSentence | null> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/test-sentences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!res.ok) throw new Error('Failed to add test sentence');
            return await res.json();
        } catch {
            return null;
        }
    }, []);

    const removeTestSentence = useCallback(async (ruleId: number, testId: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/test-sentences/${testId}`, { method: 'DELETE' });
            return res.ok;
        } catch {
            return false;
        }
    }, []);

    const validateTests = useCallback(async (ruleId: number): Promise<RuleTestSentence[]> => {
        try {
            const res = await fetch(`${API_BASE}/${ruleId}/validate-tests`, { method: 'POST' });
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    }, []);

    return {
        rules,
        loading,
        error,
        fetchAll,
        create,
        update,
        remove,
        getConditions,
        addCondition,
        removeCondition,
        getTestSentences,
        addTestSentence,
        removeTestSentence,
        validateTests,
    };
}
