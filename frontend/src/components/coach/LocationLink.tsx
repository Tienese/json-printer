/**
 * LocationLink - Clickable link that scrolls to worksheet item
 */
import { useRef } from 'react';

interface LocationLinkProps {
    itemIndex: number;
    itemType?: string;
    preview?: string;
    onNavigate: (itemIndex: number) => void;
}

export function LocationLink({ itemIndex, itemType, preview, onNavigate }: LocationLinkProps) {
    const timeoutRef = useRef<number | null>(null);

    const handleClick = () => {
        onNavigate(itemIndex);

        // Attempt to scroll to element
        const itemElement = document.querySelector(`[data-item-index="${itemIndex}"]`);
        if (itemElement) {
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Clear any existing timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Add pulse highlight
            itemElement.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
            timeoutRef.current = window.setTimeout(() => {
                itemElement.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
            }, 2000);
        }
    };

    const label = preview || `Go to item ${itemIndex + 1}`;

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700"
            title={label}
            aria-label={label}
        >
            <span className="font-mono">[{itemIndex + 1}]</span>
            {itemType && <span className="text-gray-400">{itemType}</span>}
        </button>
    );
}
