/**
 * DiagnosticCard - Displays a single diagnostic from Grammar Coach v3.0
 * 1.1.1.1 compliant: No hover effects, static styling
 */

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

interface DiagnosticCardProps {
    severity: 'ERROR' | 'WARNING' | 'INFO' | 'HINT';
    type: string;
    message: string;
    targetWord: string;
    actualCount: number;
    threshold: number;
    locations: WordLocation[];
    primarySuggestions: Suggestion[];
    secondarySuggestions: Suggestion[];
    onLocationClick?: (itemIndex: number) => void;
}

export function DiagnosticCard({
    severity,
    message,
    targetWord,
    actualCount,
    threshold,
    locations,
    primarySuggestions,
    secondarySuggestions,
    onLocationClick,
}: DiagnosticCardProps) {
    const getSeverityStyles = () => {
        switch (severity) {
            case 'ERROR':
                return 'border-red-400 bg-red-50';
            case 'WARNING':
                return 'border-amber-400 bg-amber-50';
            case 'INFO':
                return 'border-blue-400 bg-blue-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    const getSeverityIcon = () => {
        switch (severity) {
            case 'ERROR': return '[!]';
            case 'WARNING': return '[?]';
            case 'INFO': return '[i]';
            default: return '[·]';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={`p-3 rounded-lg border-2 ${getSeverityStyles()}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{getSeverityIcon()}</span>
                    <span className="font-bold text-gray-800">{targetWord}</span>
                </div>
                <span className="text-xs text-gray-500">
                    {actualCount}× (max {threshold})
                </span>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 mb-2">{message}</p>

            {/* Locations */}
            {locations.length > 0 && (
                <div className="mb-2">
                    <span className="text-xs text-gray-500 block mb-1">Found in:</span>
                    <div className="flex flex-wrap gap-1">
                        {locations.slice(0, 5).map((loc, idx) => (
                            <button
                                key={idx}
                                onClick={() => onLocationClick?.(loc.itemIndex)}
                                className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700"
                            >
                                Item {loc.itemIndex + 1}
                            </button>
                        ))}
                        {locations.length > 5 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">
                                +{locations.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Primary Suggestions */}
            {primarySuggestions.length > 0 && (
                <div className="mt-2">
                    <span className="text-xs text-gray-500 block mb-1">Try instead:</span>
                    <div className="flex flex-wrap gap-1">
                        {primarySuggestions.slice(0, 5).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => copyToClipboard(s.word)}
                                className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-800"
                                title={`${s.note} - Click to copy`}
                            >
                                {s.word}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Secondary Suggestions */}
            {secondarySuggestions.length > 0 && (
                <div className="mt-2">
                    <span className="text-xs text-gray-400 block mb-1">With restructure:</span>
                    <div className="flex flex-wrap gap-1">
                        {secondarySuggestions.slice(0, 3).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => copyToClipboard(s.word)}
                                className="px-2 py-0.5 bg-gray-100 border border-dashed border-gray-300 rounded text-xs text-gray-600"
                                title={s.note}
                            >
                                {s.word}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
