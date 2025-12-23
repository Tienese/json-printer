import type { WorksheetItem } from '../types/worksheet';

// Menu item type icons
const MENU_ITEMS = [
    { label: 'Card Block', type: 'CARD', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg> },
    { label: 'Writing Grid', type: 'GRID', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg> },
    { label: 'Vocabulary', type: 'VOCAB', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg> },
    { label: 'Multiple Choice', type: 'MULTIPLE_CHOICE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg> },
    { label: 'True / False', type: 'TRUE_FALSE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg> },
    { label: 'Matching', type: 'MATCHING', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg> },
    { label: 'Cloze / Blank', type: 'CLOZE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16M4 16h16M4 12h16M8 8h8" /></svg> },
];

interface ContextMenuProps {
    position: { x: number; y: number } | null;
    type: 'ADD' | 'DELETE';
    targetItem?: WorksheetItem;
    onAddItem: (type: string) => void;
    onDeleteItem: (item: WorksheetItem) => void;
}

/**
 * Context menu portal for right-click actions on worksheet canvas.
 * Handles both ADD (new item) and DELETE (remove item) actions.
 */
export function ContextMenuPortal({
    position,
    type,
    targetItem,
    onAddItem,
    onDeleteItem,
}: ContextMenuProps) {
    if (!position) return null;

    return (
        <div
            className="fixed z-[100] bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-150"
            style={{ left: position.x, top: position.y }}
        >
            {type === 'ADD' && (
                <>
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Element</div>
                    {MENU_ITEMS.map(opt => (
                        <button
                            key={opt.type}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary-blue flex items-center gap-3 active:bg-blue-100 transition-colors"
                            onClick={() => onAddItem(opt.type)}
                        >
                            <span className="text-gray-400">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </>
            )}

            {type === 'DELETE' && targetItem && (
                <button
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 active:bg-red-100 transition-colors"
                    onClick={() => onDeleteItem(targetItem)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    Delete Element
                </button>
            )}
        </div>
    );
}
