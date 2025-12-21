import { useState, useEffect, useCallback, useRef } from 'react';

interface RichTextToolbarProps {
  visible: boolean;
  onFormat: (command: string, value?: string) => void;
  editorRef: HTMLElement | null;
}

type FormatCommand = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
}

/**
 * Rich Text Toolbar Component
 *
 * Provides formatting buttons for contentEditable elements using native document.execCommand()
 * - Bold, Italic, Underline, Bullet List, Numbered List
 * - Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+U
 * - Active state tracking for current formatting
 */
export function RichTextToolbar({ visible, onFormat, editorRef }: RichTextToolbarProps) {
  const [activeFormats, setActiveFormats] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Update active formatting state based on current selection
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch (e) {
      console.error('Error in updateActiveFormats', e);
    }
  }, []);

  // Handle formatting button clicks
  const handleFormat = (command: FormatCommand) => {
    onFormat(command);
    updateActiveFormats();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible || !editorRef) return;

      // Only handle shortcuts when editor is focused
      if (!editorRef.contains(document.activeElement)) return;

      // Handle Escape key to close toolbar
      if (e.key === 'Escape') {
        e.preventDefault();
        editorRef.blur();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, editorRef, handleFormat]);

  // Update active formats on selection change
  useEffect(() => {
    if (!visible || !editorRef) return;

    const handleSelectionChange = () => {
      // Check if selection is within our editor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.contains(range.commonAncestorContainer)) {
          updateActiveFormats();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [visible, editorRef, updateActiveFormats]);

  if (!visible) return null;

  const getBtnClass = (active: boolean) => {
    return `bg-[#555] text-white border-none rounded-[3px] p-[5px_10px] cursor-pointer hover:bg-[#666] transition-colors ${
      active ? '!bg-[#007bff] text-white' : ''
    }`;
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute bg-[#333] p-[5px] rounded-[5px] z-[2001] flex gap-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-fadeIn print:hidden"
    >
      <button
        type="button"
        className={getBtnClass(activeFormats.bold)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleFormat('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        className={getBtnClass(activeFormats.italic)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleFormat('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        className={getBtnClass(activeFormats.underline)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleFormat('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>

      <button
        type="button"
        className={getBtnClass(activeFormats.insertUnorderedList)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleFormat('insertUnorderedList')}
        title="Bullet List"
      >
        •
      </button>

      <button
        type="button"
        className={getBtnClass(activeFormats.insertOrderedList)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => handleFormat('insertOrderedList')}
        title="Numbered List"
      >
        1.
      </button>
    </div>
  );
}
