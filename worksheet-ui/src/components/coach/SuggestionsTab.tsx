/**
 * SuggestionsTab - Shows diagnostics and suggestions
 */

import { DiagnosticCard } from './DiagnosticCard';

interface Suggestion {
    word: string;
    currentUsage: number;
    note: string;
}

interface WordLocation {
    itemIndex: number;
    itemType: string;
    preview: string;
}

interface Diagnostic {
    severity: 'ERROR' | 'WARNING' | 'INFO' | 'HINT';
    type: string;
    message: string;
    targetWord: string;
    actualCount: number;
    threshold: number;
    locations: WordLocation[];
    primarySuggestions: Suggestion[];
    secondarySuggestions: Suggestion[];
}

interface SuggestionsTabProps {
    diagnostics: Diagnostic[];
    onLocationClick?: (itemIndex: number) => void;
}

export function SuggestionsTab({ diagnostics, onLocationClick }: SuggestionsTabProps) {
    // Sort by severity: ERROR > WARNING > INFO > HINT
    const sortedDiagnostics = [...diagnostics].sort((a, b) => {
        const order = { ERROR: 0, WARNING: 1, INFO: 2, HINT: 3 };
        return (order[a.severity] || 4) - (order[b.severity] || 4);
    });

    if (diagnostics.length === 0) {
        return (
            <div className="text-center py-8">
                <span className="text-3xl block mb-2">[OK]</span>
                <p className="text-sm font-medium text-green-600">No issues found!</p>
                <p className="text-xs text-gray-500 mt-1">Your vocabulary distribution looks good.</p>
            </div>
        );
    }

    const errorCount = diagnostics.filter(d => d.severity === 'ERROR').length;
    const warningCount = diagnostics.filter(d => d.severity === 'WARNING').length;

    return (
        <div className="space-y-3">
            {/* Summary */}
            <div className="flex gap-2 text-xs">
                {errorCount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                        {errorCount} error{errorCount > 1 ? 's' : ''}
                    </span>
                )}
                {warningCount > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">
                        {warningCount} warning{warningCount > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Diagnostics List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sortedDiagnostics.map((diagnostic, idx) => (
                    <DiagnosticCard
                        key={idx}
                        {...diagnostic}
                        onLocationClick={onLocationClick}
                    />
                ))}
            </div>
        </div>
    );
}
