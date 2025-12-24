/**
 * Grid Focus Helper
 * Centralizes DOM focus logic for grid boxes and furigana inputs.
 */

const FOCUS_DELAY_MS = 50;

export type FocusTarget = 'char' | 'furigana';

/**
 * Focuses the input for a specific box in a grid.
 *
 * The focus is applied after `delay` milliseconds. When `itemId` is provided, the lookup is restricted to the grid container with a matching `data-grid-id`; otherwise the first element with `data-grid-container` is used.
 *
 * @param sectionIndex - Index of the section containing the box
 * @param boxIndex - Index of the box within the section
 * @param target - Which input to focus: `'char'` to focus the character input, `'furigana'` to focus the furigana input
 * @param delay - Milliseconds to wait before applying focus (default: FOCUS_DELAY_MS)
 * @param itemId - Optional grid item identifier to scope the lookup to a specific container
 */
export function focusGridBox(
    sectionIndex: number,
    boxIndex: number,
    target: FocusTarget = 'char',
    delay: number = FOCUS_DELAY_MS,
    itemId?: string
): void {
    setTimeout(() => {
        // If itemId provided, find that specific grid; otherwise fallback to first
        const container = itemId
            ? document.querySelector(`[data-grid-id="${itemId}"]`)
            : document.querySelector('[data-grid-container]');
        if (!container) return;

        if (target === 'furigana') {
            const furiganaInput = container.querySelector(
                `input[data-section="${sectionIndex}"][data-box="${boxIndex}"][data-type="furigana"]`
            ) as HTMLInputElement | null;
            furiganaInput?.focus();
        } else {
            const charWrapper = container.querySelector(
                `[data-section="${sectionIndex}"][data-box="${boxIndex}"][data-type="char"]`
            );
            const charInput = charWrapper?.querySelector('input.char-input') as HTMLInputElement | null;
            charInput?.focus();
        }
    }, delay);
}

/**
 * Focus element using event target's container (for keyboard navigation)
 * @param e - The keyboard event
 * @param sectionIndex - Target section
 * @param boxIndex - Target box
 * @param target - 'char' or 'furigana'
 */
export function focusGridBoxFromEvent(
    e: React.KeyboardEvent | KeyboardEvent,
    sectionIndex: number,
    boxIndex: number,
    target: FocusTarget = 'char'
): void {
    setTimeout(() => {
        const container = (e.target as HTMLElement).closest('[data-grid-container]');
        if (!container) return;

        if (target === 'furigana') {
            const furiganaInput = container.querySelector(
                `input[data-section="${sectionIndex}"][data-box="${boxIndex}"][data-type="furigana"]`
            ) as HTMLInputElement | null;
            furiganaInput?.focus();
        } else {
            const charWrapper = container.querySelector(
                `[data-section="${sectionIndex}"][data-box="${boxIndex}"][data-type="char"]`
            );
            const charInput = charWrapper?.querySelector('input.char-input') as HTMLInputElement | null;
            charInput?.focus();
        }
    }, 0); // Keyboard navigation uses 0 delay
}