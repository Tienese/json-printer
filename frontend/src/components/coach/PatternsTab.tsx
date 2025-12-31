/**
 * PatternsTab - Shows slot analysis (grammatical patterns)
 */

interface PatternsTabProps {
    slotsUsed: Record<string, number>;
    slotsMissing: string[];
    summary: string;
}

const SLOT_LABELS: Record<string, string> = {
    SUBJECT: 'WHO',
    OBJECT: 'WHAT',
    LOCATION: 'WHERE (at)',
    DIRECTION: 'WHERE (to)',
    TIME: 'WHEN',
    INSTRUMENT: 'HOW/WITH',
    COMPANION: 'WITH WHOM',
    SOURCE: 'FROM',
    GOAL: 'UNTIL',
};

export function PatternsTab({ slotsUsed, slotsMissing, summary }: PatternsTabProps) {
    const usedSlots = Object.entries(slotsUsed);
    const hasPatterns = usedSlots.length > 0 || slotsMissing.length > 0;

    if (!hasPatterns) {
        return (
            <div className="text-center py-8">
                <span className="text-3xl block mb-2">[?]</span>
                <p className="text-sm font-medium text-gray-600">No patterns detected</p>
                <p className="text-xs text-gray-500 mt-1">
                    Add sentences with particles (は, を, に, で) to see pattern analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            {summary && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {summary}
                </div>
            )}

            {/* Slots Used */}
            {usedSlots.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Patterns Found</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {usedSlots.map(([slot, count]) => (
                            <div key={slot} className="p-2 bg-green-50 border border-green-200 rounded">
                                <div className="text-sm font-bold text-green-800">
                                    {SLOT_LABELS[slot] || slot}
                                </div>
                                <div className="text-xs text-green-600">
                                    {count}× used
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Slots Missing */}
            {slotsMissing.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Not Used Yet</h4>
                    <div className="flex flex-wrap gap-2">
                        {slotsMissing.slice(0, 6).map((slot) => (
                            <span
                                key={slot}
                                className="px-2 py-1 bg-gray-100 border border-dashed border-gray-300 rounded text-xs text-gray-600"
                            >
                                {SLOT_LABELS[slot] || slot}
                            </span>
                        ))}
                        {slotsMissing.length > 6 && (
                            <span className="px-2 py-1 text-xs text-gray-400">
                                +{slotsMissing.length - 6} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
