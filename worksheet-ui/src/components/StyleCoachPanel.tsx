import { useState } from 'react';

interface StyleCheckResult {
    issues: { severity: string; message: string; itemId: string | null }[];
    score: number;
}

interface StyleCoachPanelProps {
    worksheetId: number | null;
}

/**
 * Style checker panel for the Coach sidebar.
 * Analyzes worksheet for layout and content issues.
 */
export function StyleCoachPanel({ worksheetId }: StyleCoachPanelProps) {
    const [result, setResult] = useState<StyleCheckResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runCheck = async () => {
        if (!worksheetId) {
            setError('Please save the worksheet first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/worksheets/${worksheetId}/check-style`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Style check failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return '[!]';
            case 'warning': return '[?]';
            default: return '[i]';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'text-red-600 bg-red-50';
            case 'warning': return 'text-amber-600 bg-amber-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Style Checker</h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">BETA</span>
            </div>

            {/* Check Button */}
            <button
                onClick={runCheck}
                disabled={isLoading || !worksheetId}
                className="w-full py-2.5 bg-black text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Checking...' : 'Check Style'}
            </button>

            {!worksheetId && (
                <p className="text-xs text-amber-600">
                    Save worksheet to cloud first to enable style check
                </p>
            )}

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
                            {result.issues.length === 0
                                ? 'No issues found'
                                : `${result.issues.length} issue${result.issues.length > 1 ? 's' : ''} found`}
                        </div>
                    </div>

                    {/* Issues List */}
                    {result.issues.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Issues</h4>
                            <div className="max-h-[250px] overflow-y-auto space-y-2">
                                {result.issues.map((issue, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-3 py-2 rounded-lg text-sm ${getSeverityColor(issue.severity)}`}
                                    >
                                        <span className="font-mono mr-2">{getSeverityIcon(issue.severity)}</span>
                                        {issue.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.issues.length === 0 && (
                        <div className="text-center py-4 text-green-600">
                            <span className="text-2xl block mb-2">[OK]</span>
                            <p className="text-sm font-medium">All checks passed!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
