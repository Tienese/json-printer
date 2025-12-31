import type { ReactNode } from 'react';

/**
 * V5.0 Skeleton Placeholder
 * 
 * Shows a disabled preview of future V5.0 functionality.
 * Print-friendly: Uses dashed border, visible in B&W.
 */
interface V5SkeletonProps {
    readonly title: string;
    readonly description: string;
    readonly height?: string;
    readonly children?: ReactNode;
}

export function V5Skeleton({ title, description, height = '120px', children }: V5SkeletonProps) {
    return (
        <div
            className="v5-skeleton border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 print:hidden"
            style={{ minHeight: height }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                    V5.0
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{title}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>

            {children && (
                <div className="opacity-50 pointer-events-none select-none">
                    {children}
                </div>
            )}

            <div className="text-center mt-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                    Coming Soon
                </span>
            </div>
        </div>
    );
}
