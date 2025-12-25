import { useRef, useCallback, useEffect, memo } from 'react';
import { sanitizePaste, sanitizeHTML } from '../../utils/htmlSanitizer';
import { selectAllContentOnFocus } from '../../utils/inputUtils';

interface RichTextEditorProps {
    /** The HTML content to display and edit */
    content: string;
    /** Called when content changes (on blur or after debounce) */
    onUpdate: (content: string) => void;
    /** Placeholder text shown when empty */
    placeholder?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether the field is editable (default: true) */
    editable?: boolean;
    /** Debounce delay in ms (0 = save on blur only, default: 0) */
    debounceMs?: number;
    /** Whether to select all content on focus (default: true) */
    selectOnFocus?: boolean;
    /** Test ID for automated testing */
    testId?: string;
}

/**
 * Unified rich text editor component for all worksheet editable text.
 * 
 * Features:
 * - HTML sanitization (allows: b, i, u, ul, ol, li, br)
 * - Paste cleaning
 * - Select-all-on-focus (configurable)
 * - Debounced save (configurable)
 * - Placeholder support
 * 
 * @example
 * <RichTextEditor
 *   content={item.prompt}
 *   onUpdate={(content) => onUpdate({ ...item, prompt: content })}
 *   placeholder="Enter your question..."
 * />
 */
export const RichTextEditor = memo(function RichTextEditor({
    content,
    onUpdate,
    placeholder = 'Click to edit...',
    className = '',
    editable = true,
    debounceMs = 0,
    selectOnFocus = true,
    testId,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isEditing = useRef(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync content from props ONLY if not currently editing
    useEffect(() => {
        if (editorRef.current && !isEditing.current) {
            if (editorRef.current.innerHTML !== content) {
                editorRef.current.innerHTML = content;
            }
        }
    }, [content]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const saveContent = useCallback(() => {
        if (editorRef.current) {
            const cleaned = sanitizeHTML(editorRef.current.innerHTML);
            if (cleaned !== content) {
                onUpdate(cleaned);
            }
        }
    }, [content, onUpdate]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
        document.execCommand('insertHTML', false, cleaned);
    }, []);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        isEditing.current = true;
        if (selectOnFocus) {
            selectAllContentOnFocus(e);
        }
    }, [selectOnFocus]);

    const handleBlur = useCallback(() => {
        isEditing.current = false;
        // Clear any pending debounce
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        saveContent();
    }, [saveContent]);

    const handleInput = useCallback(() => {
        if (debounceMs > 0) {
            // Clear existing timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            // Set new timer
            debounceTimer.current = setTimeout(() => {
                saveContent();
            }, debounceMs);
        }
    }, [debounceMs, saveContent]);

    return (
        <div
            ref={editorRef}
            className={`editable editable-placeholder ${className}`}
            data-placeholder={placeholder}
            data-testid={testId}
            contentEditable={editable}
            suppressContentEditableWarning
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            onInput={debounceMs > 0 ? handleInput : undefined}
        />
    );
});
