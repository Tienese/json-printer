import { useRef, useCallback, useEffect } from 'react';
import type { TextItem } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';

interface TextItemProps {
  item: TextItem;
  onUpdate: (item: TextItem) => void;
}

export function TextItemComponent({ item, onUpdate }: TextItemProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);

  const style: React.CSSProperties = {
    fontSize: item.fontSize || '12pt',
    textAlign: item.textAlign || 'left',
    fontWeight: item.fontWeight || 'normal',
    marginTop: item.marginTop || '0.05cm',
    marginBottom: item.marginBottom || '0.05cm',
  };

  // Sync content from props ONLY if not currently editing to avoid overwriting user input
  useEffect(() => {
    if (editorRef.current && !isEditing.current) {
      if (editorRef.current.innerHTML !== item.content) {
        editorRef.current.innerHTML = item.content;
      }
    }
  }, [item.content]);

  // Handle paste with HTML sanitization
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertHTML', false, cleaned);
  }, []);

  // Handle blur - save content
  const handleBlur = useCallback(() => {
    isEditing.current = false;
    if (editorRef.current) {
      const cleaned = sanitizeHTML(editorRef.current.innerHTML);
      // Only update if changed to avoid unnecessary renders
      if (cleaned !== item.content) {
        onUpdate({ ...item, content: cleaned });
      }
    }
  }, [item, onUpdate]);

  // Handle focus - show toolbar
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

  return (
    <div className="flex items-baseline">
      {item.showPromptNumber && item.promptNumber && (
        <span className="font-bold mr-[5px] text-[11pt] leading-[1]" data-testid="question-number">
          {item.promptNumber}.
        </span>
      )}
      <div
        ref={editorRef}
        className="flex-1 border-none bg-transparent outline-none resize-none overflow-hidden min-h-[1.4em] p-[5px] focus:bg-[#eef] empty:before:content-['Click_to_add_text...'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-['']"
        style={style}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
      />
    </div>
  );
}
