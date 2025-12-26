import { useState } from 'react';
import { DistributionTab } from './coach/DistributionTab';
import { SuggestionsTab } from './coach/SuggestionsTab';
import { PatternsTab } from './coach/PatternsTab';

/**
 * Grammar Coach v3.0 Response Types
 */
interface GrammarCoachResult {
    meta: {
        validity: string;
        validityNote: string;
        poolSize: number;
        wordsAnalyzed: number;
    };
    distribution: {
        totalWords: number;
        uniqueWords: number;
        mean: number;
        stdDev: number;
        overuseThreshold: number;
        categoryBreakdown: Record<string, { poolSize: number; used: number; coverage: number }>;
    };
    diagnostics: Array<{
        severity: 'ERROR' | 'WARNING' | 'INFO' | 'HINT';
        type: string;
        message: string;
        targetWord: string;
        actualCount: number;
        threshold: number;
        locations: Array<{ itemIndex: number; itemType: string; preview: string }>;
        primarySuggestions: Array<{ word: string; currentUsage: number; note: string }>;
        secondarySuggestions: Array<{ word: string; currentUsage: number; note: string }>;
    }>;
    slotAnalysis: {
        slotsUsed: Record<string, number>;
        slotsMissing: string[];
        summary: string;
    };
    score: {
        value: number;
        interpretation: string;
    };
}

interface LanguageCoachPanelProps {
    worksheetJson: string;
    onNavigateToItem?: (itemIndex: number) => void;
}

type TabId = 'distribution' | 'suggestions' | 'patterns';

/**
 * Language Coach v3.0 - Unified analysis panel with tabs
 * 1.1.1.1 compliant: No hover effects, static styling
 */
export function LanguageCoachPanel({ worksheetJson, onNavigateToItem }: LanguageCoachPanelProps) {
    const [result, setResult] = useState<GrammarCoachResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('suggestions');

    const runAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/grammar/analyze-v3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    worksheetJson,
                    lessonScope: null // Use all lessons
                }),
            });

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
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getValidityBadge = (validity: string) => {
        switch (validity) {
            case 'HIGH': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700';
            case 'LOW': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const tabs = [
        { id: 'distribution' as TabId, label: 'Stats' },
        { id: 'suggestions' as TabId, label: 'Issues' },
        { id: 'patterns' as TabId, label: 'Patterns' },
    ];

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Language Coach</h3>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">v3.0</span>
            </div>

            {/* Analyze Button */}
            <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="w-full py-2.5 bg-black text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze'}
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
                    {/* Score + Validity */}
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                        <div className={`text-4xl font-black ${getScoreColor(result.score.value)}`}>
                            {result.score.value}/100
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {result.score.interpretation}
                        </div>
                        <div className="mt-2 flex justify-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${getValidityBadge(result.meta.validity)}`}>
                                {result.meta.validity} confidence
                            </span>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 text-xs font-medium ${activeTab === tab.id
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'suggestions' && result.diagnostics.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px]">
                                        {result.diagnostics.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'distribution' && (
                            <DistributionTab
                                totalWords={result.distribution.totalWords}
                                uniqueWords={result.distribution.uniqueWords}
                                mean={result.distribution.mean}
                                stdDev={result.distribution.stdDev}
                                overuseThreshold={result.distribution.overuseThreshold}
                                categoryBreakdown={result.distribution.categoryBreakdown}
                            />
                        )}

                        {activeTab === 'suggestions' && (
                            <SuggestionsTab
                                diagnostics={result.diagnostics}
                                onLocationClick={onNavigateToItem}
                            />
                        )}

                        {activeTab === 'patterns' && (
                            <PatternsTab
                                slotsUsed={result.slotAnalysis.slotsUsed}
                                slotsMissing={result.slotAnalysis.slotsMissing}
                                summary={result.slotAnalysis.summary}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
