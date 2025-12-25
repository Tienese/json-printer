import React, { useState } from 'react';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { aiLog } from '../utils/aiLogger';

interface VocabAnalysisResult {
    coveragePercent: number;
    usedCount: number;
    totalVocabCount: number;
    missingWords: {
        baseForm: string;
        displayForm: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    lessonId: number;
}

interface VocabCoachPanelProps {
    worksheetId: number | null;
    onRefresh: () => void;
}

export const VocabCoachPanel: React.FC<VocabCoachPanelProps> = ({ worksheetId }) => {
    const [lessonId, setLessonId] = useState<number>(1);
    const [analysis, setAnalysis] = useState<VocabAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        aiLog.action('VocabCoach', 'ANALYSIS_STARTED', { worksheetId, lessonId });

        try {
            if (worksheetId) {
                // Real API Call
                const response = await fetch(`/api/worksheets/${worksheetId}/analyze?lessonId=${lessonId}`, {
                    method: 'POST', // Assuming POST to trigger analysis, or GET if it's cached
                });
                if (!response.ok) {
                    throw new Error(`Analysis failed: ${response.statusText}`);
                }
                const data = await response.json();
                setAnalysis(data);
                aiLog.state('VocabCoach', 'ANALYSIS_COMPLETED', { coverage: data.coveragePercent });
            } else {
                // Fallback for unsaved worksheets (Mock)
                // In production, we might want to POST the content to analyze directly
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockData: VocabAnalysisResult = {
                    coveragePercent: 0,
                    usedCount: 0,
                    totalVocabCount: 20,
                    lessonId,
                    missingWords: []
                };
                setAnalysis(mockData);
                aiLog.state('VocabCoach', 'ANALYSIS_SKIPPED', { reason: 'No Worksheet ID' });
            }

        } catch (err) {
            console.error(err);
            setError('Failed to analyze vocabulary coverage.');
            aiLog.error('VocabCoach', 'ANALYSIS_FAILED', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={20} className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-800">Vocabulary Coach</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Lesson</label>
                        <select
                            value={lessonId}
                            onChange={(e) => setLessonId(Number(e.target.value))}
                            className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {[1, 2, 3, 4, 5].map(id => (
                                <option key={id} value={id}>Lesson {id}: Introduction to CS</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        {isLoading ? 'Analyzing...' : 'Analyze Coverage'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-start gap-2 mb-4">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {!analysis && !isLoading && !error && (
                    <div className="text-center text-gray-400 mt-8 text-sm">
                        Select a lesson and run analysis to see vocabulary coverage for this worksheet.
                    </div>
                )}

                {analysis && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* Score Card */}
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {analysis.coveragePercent}%
                            </div>
                            <div className="text-sm text-gray-600">Coverage Score</div>
                            <div className="mt-2 text-xs text-gray-500">
                                Used {analysis.usedCount} of {analysis.totalVocabCount} target words
                            </div>
                        </div>

                        {/* Missing Words */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Missing Concepts ({analysis.missingWords.length})
                            </h4>
                            <div className="space-y-2">
                                {analysis.missingWords.map((word, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 rounded-md border border-gray-100 hover:bg-gray-50 group"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{word.baseForm}</div>
                                            <div className="text-xs text-gray-500">{word.displayForm}</div>
                                        </div>
                                        <div className={`
                                            w-2 h-2 rounded-full
                                            ${word.priority === 'high' ? 'bg-red-500' :
                                              word.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-300'}
                                        `} title={`Priority: ${word.priority}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
