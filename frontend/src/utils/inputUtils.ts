/**
 * Utility functions for faster text input UX
 */

/**
 * Select all text on focus - useful for quick replacement of placeholder/existing text.
 * Use as: onFocus={selectOnFocus}
 */
export const selectOnFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.select();
};

/**
 * Select all content in a contentEditable element on focus.
 * Use as: onFocus={selectAllContentOnFocus}
 */
export const selectAllContentOnFocus = (e: React.FocusEvent<HTMLElement>) => {
    const el = e.target;
    if (el.textContent && el.textContent.length > 0) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
};

/**
 * Create an onFocus handler that selects all text.
 * Useful when you need to add other focus behavior.
 */
export const createSelectOnFocus = (additionalHandler?: () => void) => {
    return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.select();
        additionalHandler?.();
    };
};

/**
 * Create an onFocus handler for contentEditable that selects all content.
 */
export const createSelectAllContentOnFocus = (additionalHandler?: () => void) => {
    return (e: React.FocusEvent<HTMLElement>) => {
        selectAllContentOnFocus(e);
        additionalHandler?.();
    };
};

/**
 * Props to spread on inputs for select-on-focus behavior
 */
export const selectOnFocusProps = {
    onFocus: selectOnFocus,
};
