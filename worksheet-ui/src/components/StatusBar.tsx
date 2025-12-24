import { Minus, Plus } from 'lucide-react';
import type { WorksheetPage } from '../types/worksheet';

interface StatusBarProps {
    pages: WorksheetPage[];
    currentPageIndex: number;
    totalPages: number;
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

/**
 * Bottom status bar showing worksheet metadata and zoom controls.
 * VS Code-style status bar layout: info on left, controls on right.
 */
export function StatusBar({
    pages,
    currentPageIndex,
    totalPages,
    zoom,
    onZoomChange,
}: StatusBarProps) {
    const totalItems = pages.reduce((acc, p) => acc + p.items.length, 0);

    const handleZoomOut = () => onZoomChange(Math.max(0.5, zoom - 0.1));
    const handleZoomIn = () => onZoomChange(Math.min(2, zoom + 0.1));
    const handleZoomReset = () => onZoomChange(1);

    return (
        <div className="col-span-3 h-8 theme-surface border-t theme-border flex items-center justify-between px-4 text-xs theme-text-secondary print:hidden">
            {/* Left: Metadata */}
            <div className="flex items-center gap-4">
                <span>📄 {totalPages} page{totalPages !== 1 ? 's' : ''}</span>
                <span className="theme-text-muted">•</span>
                <span>📦 {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                <span className="theme-text-muted">•</span>
                <span>Page {currentPageIndex + 1}/{totalPages}</span>
            </div>

            {/* Right: Zoom Controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleZoomOut}
                    className="w-6 h-6 flex items-center justify-center theme-text-secondary hover:bg-[var(--color-elevated)] rounded"
                    title="Zoom Out (50% min)"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={handleZoomReset}
                    className="px-2 h-6 text-xs font-mono hover:bg-[var(--color-elevated)] rounded"
                    title="Reset to 100%"
                >
                    {Math.round(zoom * 100)}%
                </button>
                <button
                    onClick={handleZoomIn}
                    className="w-6 h-6 flex items-center justify-center theme-text-secondary hover:bg-[var(--color-elevated)] rounded"
                    title="Zoom In (200% max)"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}
