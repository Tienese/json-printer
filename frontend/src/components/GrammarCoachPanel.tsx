import { useState } from 'react';

interface GrammarAnalysisResult {
    totalWordsScanned: number;
    uniqueWordsFound: number;
    posCounts: { pos: string; count: number }[];
    violations: {
        ruleId: number;
        ruleName: string;
        ruleType: string;
        targetWord: string;
        actualCount: number;
        threshold: number;
        message: string;
        suggestions: string[];
    }[];
    score: number;
}

interface GrammarCoachPanelProps {
    worksheetId: number | null;
    worksheetJson: string;
}

/**
 * Grammar analysis panel for the Coach sidebar.
 * Analyzes worksheet content for grammar patterns and overuse.
 */
export function GrammarCoachPanel({ worksheetId, worksheetJson }: GrammarCoachPanelProps) {
    const [result, setResult] = useState<GrammarAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Use worksheet ID if available, otherwise analyze JSON directly
            const url = worksheetId
                ? `/api/worksheets/${worksheetId}/analyze-grammar`
                : '/api/grammar/analyze';

            const options: RequestInit = worksheetId
                ? { method: 'POST' }
                : {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ worksheetJson }),
                };

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error('Grammar analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPosLabel = (pos: string) => {
        const labels: Record<string, string> = {
            '名詞': 'Noun',
            '動詞': 'Verb',
            '形容詞': 'Adj',
            '副詞': 'Adv',
            '代名詞': 'Pronoun',
            '接続詞': 'Conj',
            '感動詞': 'Interj',
        };
        return labels[pos] || pos;
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Grammar Coach</h3>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">BETA</span>
            </div>

            {/* Analyze Button */}
            <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="w-full py-2.5 bg-black text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Grammar'}
            </button>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                    {/* Score */}
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                        <div className={`text-4xl font-black ${getScoreColor(result.score)}`}>
                            {result.score}/100
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {result.totalWordsScanned} words · {result.uniqueWordsFound} unique
                        </div>
                    </div>

                    {/* POS Distribution */}
                    {result.posCounts.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Word Types</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.posCounts.slice(0, 6).map((pc, idx) => (
                                    <div key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                        <span className="font-medium">{getPosLabel(pc.pos)}</span>
                                        <span className="text-gray-400 ml-1">{pc.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Violations */}
                    {result.violations.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Issues Found</h4>
                            <div className="space-y-2">
                                {result.violations.map((v, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-amber-800">{v.targetWord}</span>
                                            <span className="text-xs text-amber-600">
                                                {v.actualCount}× (max {v.threshold})
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-700">{v.message}</p>
                                        {v.suggestions.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                <span className="text-xs text-gray-500">Try:</span>
                                                {v.suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs font-medium text-amber-800"
                                                        title="Click to copy"
                                                        onClick={() => navigator.clipboard.writeText(s)}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.violations.length === 0 && (
                        <div className="text-center py-4 text-green-600">
                            <span className="text-2xl block mb-2">[OK]</span>
                            <p className="text-sm font-medium">No grammar issues found!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
