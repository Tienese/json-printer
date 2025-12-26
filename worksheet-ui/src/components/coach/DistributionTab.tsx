/**
 * DistributionTab - Shows word frequency distribution
 */

interface CategoryBreakdown {
    poolSize: number;
    used: number;
    coverage: number;
}

interface DistributionTabProps {
    totalWords: number;
    uniqueWords: number;
    mean: number;
    stdDev: number;
    overuseThreshold: number;
    categoryBreakdown: Record<string, CategoryBreakdown>;
}

export function DistributionTab({
    totalWords,
    uniqueWords,
    mean,
    stdDev,
    overuseThreshold,
    categoryBreakdown,
}: DistributionTabProps) {
    const categories = Object.entries(categoryBreakdown);

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 60) return 'text-green-600';
        if (coverage >= 30) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="text-2xl font-bold text-gray-800">{totalWords}</div>
                    <div className="text-xs text-gray-500">Total Words</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="text-2xl font-bold text-gray-800">{uniqueWords}</div>
                    <div className="text-xs text-gray-500">Unique</div>
                </div>
            </div>

            {/* Threshold Info */}
            <div className="p-2 bg-blue-50 rounded text-sm">
                <span className="text-blue-700">
                    Overuse threshold: <strong>{overuseThreshold}</strong>
                </span>
                <span className="text-blue-500 text-xs block">
                    (mean: {mean.toFixed(1)}, σ: {stdDev.toFixed(1)})
                </span>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">By Category</h4>
                    <div className="space-y-1">
                        {categories.map(([name, stats]) => (
                            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700 capitalize">{name}</span>
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${getCoverageColor(stats.coverage)}`}>
                                        {stats.coverage.toFixed(0)}%
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">
                                        ({stats.used}/{stats.poolSize})
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
