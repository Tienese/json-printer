import { useRef, useCallback, useEffect } from 'react';
import type { CardItem } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';
import { QuestionNumber } from './shared/QuestionNumber';

interface CardItemProps {
  item: CardItem;
  onUpdate: (item: CardItem) => void;
}

// Language indicators
const LANG_INDICATORS = {
  VI: 'Ghi chú',
  EN: 'Note',
  JP: 'メモ',
};

export function CardItemComponent({ item, onUpdate }: CardItemProps) {
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

  // Get language indicator
  const language = item.language || 'VI'; // Default to Vietnamese
  const langIndicator = LANG_INDICATORS[language];

  // Card title with underlines (inline with border)
  const renderCardTitle = () => {
    if (!item.cardHeader) return null;

    const titleText = `${langIndicator}: ${item.cardHeader}`;

    return (
      <span className="absolute -top-[0.6em] left-[3mm] bg-white px-[2mm] text-[10pt] font-bold print:bg-white">
        <span className="border-b-2 border-black">{titleText}</span>
      </span>
    );
  };

  return (
    <div className="flex items-baseline">
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
            className="border-none bg-transparent outline-none resize-none overflow-hidden min-h-[1.4em] print:bg-white empty:before:content-['Click_to_add_card_content...'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-['']"
            style={style}
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
