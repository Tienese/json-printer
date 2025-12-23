import { useRef, useCallback, useEffect } from 'react';
import { sanitizePaste, sanitizeHTML } from '../../utils/htmlSanitizer';
import { selectAllContentOnFocus } from '../../utils/inputUtils';
import type { ViewMode } from '../../types/worksheet';

interface QuestionPromptProps {
    content: string;
    onUpdate: (content: string) => void;
    placeholder?: string;
    className?: string;
    mode: ViewMode;
    editable?: boolean;
}

/**
 * Reusable contentEditable prompt component for question items.
 * Provides consistent behavior for:
 * - Paste sanitization
 * - Select-all-on-focus
 * - HTML sanitization on blur
 * - Placeholder text
 */
export function QuestionPrompt({
    content,
    onUpdate,
    placeholder = 'Enter your question...',
    className = '',
    mode,
    editable = true,
}: QuestionPromptProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isEditing = useRef(false);

    // Sync content from props when not editing
    useEffect(() => {
        if (editorRef.current && !isEditing.current) {
            if (editorRef.current.innerHTML !== content) {
                editorRef.current.innerHTML = content;
            }
        }
    }, [content]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
        document.execCommand('insertHTML', false, cleaned);
    }, []);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        isEditing.current = true;
        // Select all content on focus for quick replacement
        selectAllContentOnFocus(e);
    }, []);

    const handleBlur = useCallback(() => {
        isEditing.current = false;
        if (editorRef.current) {
            const cleaned = sanitizeHTML(editorRef.current.innerHTML);
            if (cleaned !== content) {
                onUpdate(cleaned);
            }
        }
    }, [content, onUpdate]);

    const isEditable = editable && mode === 'teacher';

    return (
        <div
            ref={editorRef}
            className={`outline-none min-h-[1.4em] ${isEditable ? 'focus:outline-dashed focus:outline-1 focus:outline-gray-300' : ''} empty:before:content-['${placeholder.replace(/'/g, "\\'")}'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-[''] ${className}`}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
        />
    );
}
