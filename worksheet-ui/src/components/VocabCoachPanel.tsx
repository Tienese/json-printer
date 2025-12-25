import { useState } from 'react';

interface VocabAnalysisResult {
    coveragePercent: number;
    totalVocabCount: number;
    usedCount: number;
    missingWords: { displayForm: string; baseForm: string }[];
}

interface VocabCoachPanelProps {
    worksheetId: number | null;
    worksheetJson: string;
    onInsertWord?: (word: { term: string; meaning: string }) => void;
}

export function VocabCoachPanel({ worksheetId, worksheetJson: _worksheetJson, onInsertWord }: VocabCoachPanelProps) {
    const [lessonId, setLessonId] = useState(1);
    const [analysis, setAnalysis] = useState<VocabAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAllMissing, setShowAllMissing] = useState(false);

    const runAnalysis = async () => {
        if (!worksheetId) {
            setError('Please save the worksheet first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/worksheets/${worksheetId}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonIds: [lessonId] }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const result = await response.json();
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const getCoverageColor = (percent: number) => {
        if (percent >= 80) return 'text-green-600';
        if (percent >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const displayedMissing = showAllMissing
        ? analysis?.missingWords
        : analysis?.missingWords.slice(0, 10);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Vocabulary Coach</h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">BETA</span>
            </div>

            {/* Lesson Selector */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Target Lesson</label>
                <select
                    value={lessonId}
                    onChange={(e) => setLessonId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>Lesson {n}</option>
                    ))}
                </select>
            </div>

            {/* Analyze Button */}
            <button
                onClick={runAnalysis}
                disabled={isLoading || !worksheetId}
                className="w-full py-2.5 bg-black text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Coverage'}
            </button>

            {!worksheetId && (
                <p className="text-xs text-amber-600">
                    ⚠ Save worksheet to cloud first to enable analysis
                </p>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Results */}
            {analysis && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                    {/* Coverage Score */}
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                        <div className={`text-4xl font-black ${getCoverageColor(analysis.coveragePercent)}`}>
                            {analysis.coveragePercent}%
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {analysis.usedCount} of {analysis.totalVocabCount} words covered
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${analysis.coveragePercent >= 80 ? 'bg-green-500' :
                                analysis.coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${analysis.coveragePercent}%` }}
                        />
                    </div>

                    {/* Missing Words */}
                    {analysis.missingWords.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Missing Words</h4>
                                <span className="text-xs text-gray-400">{analysis.missingWords.length}</span>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto space-y-1">
                                {displayedMissing?.map((word, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-blue-50"
                                        onClick={() => onInsertWord?.({ term: word.displayForm, meaning: '' })}
                                        title="Click to add to worksheet"
                                    >
                                        <span className="font-medium">{word.displayForm}</span>
                                        {word.displayForm !== word.baseForm && (
                                            <span className="text-xs text-gray-400">({word.baseForm})</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {analysis.missingWords.length > 10 && (
                                <button
                                    onClick={() => setShowAllMissing(!showAllMissing)}
                                    className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
                                >
                                    {showAllMissing ? 'Show less' : `Show all ${analysis.missingWords.length} words`}
                                </button>
                            )}
                        </div>
                    )}

                    {analysis.missingWords.length === 0 && (
                        <div className="text-center py-4 text-green-600">
                            <span className="text-2xl">🎉</span>
                            <p className="text-sm font-medium mt-2">Perfect coverage!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
