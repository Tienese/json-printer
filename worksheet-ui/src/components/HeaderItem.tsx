import { useRef, useCallback, useEffect } from 'react';
import type { HeaderItem } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';

interface HeaderItemProps {
  item: HeaderItem;
  onUpdate: (item: HeaderItem) => void;
}

export function HeaderItemComponent({ item, onUpdate }: HeaderItemProps) {
  const editorRef = useRef<HTMLHeadingElement>(null);
  const isEditingTitle = useRef(false);

  const style: React.CSSProperties = {
    fontSize: item.fontSize || '18pt',
    textAlign: item.textAlign || 'center',
    fontWeight: item.fontWeight || 'bold',
    marginTop: item.marginTop || '0cm',
    marginBottom: item.marginBottom || '0.1cm',
  };

  // Sync title from props ONLY if not currently editing
  useEffect(() => {
    if (editorRef.current && !isEditingTitle.current) {
      if (editorRef.current.innerHTML !== (item.title || '')) {
        editorRef.current.innerHTML = item.title || '';
      }
    }
  }, [item.title]);

  // Handle paste with HTML sanitization
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    // Strip line breaks for single-line behavior
    const singleLine = cleaned.replace(/<br\s*\/?>/gi, ' ').replace(/\n/g, ' ');
    document.execCommand('insertHTML', false, singleLine);
  }, []);

  // Handle blur - save content
  const handleBlur = useCallback(() => {
    isEditingTitle.current = false;
    if (editorRef.current) {
      let cleaned = sanitizeHTML(editorRef.current.innerHTML);
      // Strip <br> tags to keep single-line behavior
      cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
      if (cleaned !== item.title) {
        onUpdate({ ...item, title: cleaned });
      }
    }
  }, [item, onUpdate]);

  // Handle keypress - prevent line breaks
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  return (
    <div>
      <h1
        ref={editorRef}
        className="border-none bg-transparent w-full outline-none p-[5px] focus:bg-[#eef] empty:before:content-['Click_to_add_title...'] empty:before:text-gray-400 empty:before:italic focus:empty:before:content-['']"
        style={style}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { isEditingTitle.current = true; }}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onKeyPress={handleKeyPress}
      ></h1>
      <div className="flex justify-between gap-[1cm] mb-[0.2cm]">
        {item.showName && (
          <div className="flex-1 flex items-baseline">
            <span className="font-bold mr-[5px] p-[5px]">Name:</span>
            <div className="flex-1 border-b border-black"></div>
          </div>
        )}
        {item.showDate && (
          <div className="flex-1 flex items-baseline">
            <span className="font-bold mr-[5px] p-[5px]">Date:</span>
            <div className="flex-1 border-b border-black"></div>
          </div>
        )}
      </div>
    </div>
  );
}
