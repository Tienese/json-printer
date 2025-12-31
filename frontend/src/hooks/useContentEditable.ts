import { useRef, useCallback, useEffect } from 'react';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';

interface UseContentEditableOptions {
    initialContent: string;
    onSave: (content: string) => void;
}

/**
 * Shared hook for contentEditable fields.
 * Handles paste sanitization, focus cursor positioning, and blur saves.
 */
export function useContentEditable({ initialContent, onSave }: UseContentEditableOptions) {
    const ref = useRef<HTMLDivElement>(null);
    const isEditing = useRef(false);

    // Sync content from props ONLY if not currently editing
    useEffect(() => {
        if (ref.current && !isEditing.current) {
            if (ref.current.innerHTML !== initialContent) {
                ref.current.innerHTML = initialContent;
            }
        }
    }, [initialContent]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
        document.execCommand('insertHTML', false, cleaned);
    }, []);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        isEditing.current = true;
        // Move cursor to end of text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(e.target);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, []);

    const handleBlur = useCallback(() => {
        isEditing.current = false;
        if (ref.current) {
            const cleaned = sanitizeHTML(ref.current.innerHTML);
            if (cleaned !== initialContent) {
                onSave(cleaned);
            }
        }
    }, [initialContent, onSave]);

    return {
        ref,
        handlePaste,
        handleFocus,
        handleBlur,
        isEditing,
    };
}
