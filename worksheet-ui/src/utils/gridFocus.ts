/**
 * Grid Focus Helper
 * Centralizes DOM focus logic for grid boxes and furigana inputs.
 */

const FOCUS_DELAY_MS = 50;

export type FocusTarget = 'char' | 'furigana';

/**
 * Focus a specific box in the grid.
 * @param sectionIndex - The section index
 * @param boxIndex - The box index within the section
 * @param target - Whether to focus 'char' input or 'furigana' input
 * @param delay - Optional delay in ms before focusing (default: 50)
 */
export function focusGridBox(
    sectionIndex: number,
    boxIndex: number,
    target: FocusTarget = 'char',
    delay: number = FOCUS_DELAY_MS
): void {
    setTimeout(() => {
        const container = document.querySelector('[data-grid-container]');
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
