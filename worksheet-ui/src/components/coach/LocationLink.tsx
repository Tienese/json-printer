/**
 * LocationLink - Clickable link that scrolls to worksheet item
 */

interface LocationLinkProps {
    itemIndex: number;
    itemType?: string;
    preview?: string;
    onNavigate: (itemIndex: number) => void;
}

export function LocationLink({ itemIndex, itemType, preview, onNavigate }: LocationLinkProps) {
    const handleClick = () => {
        onNavigate(itemIndex);

        // Attempt to scroll to element
        const itemElement = document.querySelector(`[data-item-index="${itemIndex}"]`);
        if (itemElement) {
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add pulse highlight
            itemElement.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
            setTimeout(() => {
                itemElement.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
            }, 2000);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700"
            title={preview || `Go to item ${itemIndex + 1}`}
        >
            <span className="font-mono">[{itemIndex + 1}]</span>
            {itemType && <span className="text-gray-400">{itemType}</span>}
        </button>
    );
}
