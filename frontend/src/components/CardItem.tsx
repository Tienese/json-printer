import { useRef, useCallback, useEffect } from 'react';
import type { CardItem } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';
import { QuestionNumber } from './shared/QuestionNumber';

interface CardItemProps {
  item: CardItem;
  onUpdate: (item: CardItem) => void;
}

export function CardItemComponent({ item, onUpdate }: CardItemProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);

  const contentStyle: React.CSSProperties = {
    fontSize: item.fontSize || '12pt',
    textAlign: item.textAlign || 'left',
    fontWeight: item.fontWeight || 'normal',
    columnCount: item.columns || 1,
    columnGap: '3mm',
  };

  const containerStyle: React.CSSProperties = {
    marginTop: item.marginTop || '0.5mm',
    marginBottom: item.marginBottom || '0.5mm',
  };

  // Sync content from props ONLY if not currently editing to avoid overwriting user input
  useEffect(() => {
    if (editorRef.current && !isEditing.current) {
      if (editorRef.current.innerHTML !== item.content) {
        editorRef.current.innerHTML = item.content;
      }
    }
  }, [item.content]);

  // Sync title from props
  useEffect(() => {
    if (titleRef.current && document.activeElement !== titleRef.current) {
      if (titleRef.current.textContent !== (item.cardHeader || '')) {
        titleRef.current.textContent = item.cardHeader || '';
      }
    }
  }, [item.cardHeader]);

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

  // Handle title blur - save title
  const handleTitleBlur = useCallback(() => {
    if (titleRef.current) {
      const newTitle = titleRef.current.textContent || '';
      if (newTitle !== item.cardHeader) {
        onUpdate({ ...item, cardHeader: newTitle });
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

  // Card title with ASCII indicator - editable inline
  const renderCardTitle = () => {
    return (
      <div className="absolute -top-[0.6em] left-[3mm] bg-white px-[2mm] text-[10pt] font-bold print:bg-white flex items-center">
        <span className="mr-1 text-gray-500">▸</span>
        <div
          ref={titleRef}
          className="editable editable-placeholder min-w-[20mm]"
          data-placeholder="Card title..."
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
        />
      </div>
    );
  };

  return (
    <div className="flex items-baseline" style={containerStyle}>
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
        className="leading-[1]"
      />

      <div className="flex-1">
        {/* Card Content Box with overlaid title */}
        <div
          className={`relative p-[3mm] pt-[5mm] print:bg-white ${(item.showBorder ?? true) ? 'border-2 border-black print:border-black' : ''}`}
          style={{
            minHeight: '2cm',
            borderStyle: (item.showBorder ?? true) ? (item.borderStyle || 'solid') : 'none',
          }}
        >
          {/* Card Title - overlays the top border */}
          {renderCardTitle()}

          <div
            ref={editorRef}
            className="editable editable-placeholder border-none bg-transparent resize-none overflow-hidden min-h-[1.4em] print:bg-white"
            data-placeholder="Click to add card content..."
            style={contentStyle}
            contentEditable
            suppressContentEditableWarning
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
          />
        </div>
      </div>
    </div>
  );
}
