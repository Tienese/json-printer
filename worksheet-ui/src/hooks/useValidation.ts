import { useState, useCallback } from 'react';

/**
 * API types for validation
 */
export interface ViolationDTO {
    ruleId: number;
    ruleName: string;
    message: string;
    position: number;
    word: string;
}

export interface ValidationResultDTO {
    isValid: boolean;
    violations: ViolationDTO[];
}

const API_BASE = '/api/validate';

/**
 * Hook for validating arbitrary text.
 */
export function useValidation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ValidationResultDTO | null>(null);

    const validate = useCallback(async (text: string): Promise<ValidationResultDTO | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) throw new Error('Validation failed');
            const data = await res.json();
            setResult(data);
            return data;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return {
        result,
        loading,
        error,
        validate,
        clear,
    };
}
