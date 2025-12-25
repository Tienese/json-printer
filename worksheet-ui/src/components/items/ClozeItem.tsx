import { useRef, useCallback, useEffect, type FC } from 'react';
import type { ClozeItem, ViewMode } from '../../types/worksheet';
import { QuestionNumber } from '../shared/QuestionNumber';
import { sanitizeHTML, sanitizePaste } from '../../utils/htmlSanitizer';

interface Props {
  item: ClozeItem;
  mode: ViewMode;
  onUpdate?: (item: ClozeItem) => void;
}

// Parse template to extract text and blanks with answers
function parseTemplate(template: string, answers: string[]) {
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankIndex?: number }> = [];
  const regex = /\{\{blank\}\}/gi;
  let lastIndex = 0;
  let blankIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    // Add text before the blank
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: template.slice(lastIndex, match.index) });
    }
    // Add the blank
    parts.push({ type: 'blank', content: answers[blankIndex] || '', blankIndex });
    blankIndex++;
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < template.length) {
    parts.push({ type: 'text', content: template.slice(lastIndex) });
  }

  return parts;
}

// Generate label based on list style
const getLabel = (style: string, index: number): string => {
  switch (style) {
    case 'number': return `${index + 1}.`;
    case 'letter': return `${String.fromCharCode(97 + index)}.`;
    case 'roman': {
      const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return `${romanArr[index] || index + 1}.`;
    }
    case 'bullet': return '•';
    case 'none':
    default: return '';
  }
};

export const ClozeItemComponent: FC<Props> = ({
  item,
  mode,
  onUpdate,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);

  // Build the display HTML from template and answers
  const buildDisplayHTML = useCallback(() => {
    if (mode === 'teacher') {
      // In teacher mode, show the template with {{blank}} markers or answer placeholders
      const lines = item.template.split('\n');
      return lines.map((line, lineIndex) => {
        const parts = parseTemplate(line, item.answers);
        return `<div class="flex items-baseline mb-1">${item.listStyle && item.listStyle !== 'none'
          ? `<span class="mr-2 font-medium text-gray-700 select-none min-w-[1.5em]">${getLabel(item.listStyle, lineIndex)}</span>`
          : ''}<span class="flex-1">${parts.map(part => {
            if (part.type === 'blank') {
              return `<span class="cloze-blank-edit border-b-2 border-black px-1 min-w-[2cm] inline-block" data-blank-index="${part.blankIndex}" contenteditable="true">${part.content || ''}</span>`;
            }
            return part.content;
          }).join('')}</span></div>`;
      }).join('');
    } else {
      // Student mode - show blank underlines
      const lines = item.template.split('\n');
      return lines.map((line, lineIndex) => {
        const parts = parseTemplate(line, item.answers);
        return `<div class="flex items-baseline mb-1">${item.listStyle && item.listStyle !== 'none'
          ? `<span class="mr-2 font-medium text-gray-700 select-none min-w-[1.5em]">${getLabel(item.listStyle, lineIndex)}</span>`
          : ''}<span class="flex-1">${parts.map(part => {
            if (part.type === 'blank') {
              return `<span class="inline-block border-b border-black mx-1" style="width: ${item.blankWidth || '4cm'}">&nbsp;</span>`;
            }
            return part.content;
          }).join('')}</span></div>`;
      }).join('');
    }
  }, [item.template, item.answers, item.listStyle, item.blankWidth, mode]);

  // Sync content from props
  useEffect(() => {
    if (editorRef.current && !isEditing.current) {
      editorRef.current.innerHTML = buildDisplayHTML();
    }
  }, [buildDisplayHTML]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertText', false, cleaned.replace(/<[^>]*>/g, ''));
  }, []);

  const handleFocus = useCallback(() => {
    isEditing.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isEditing.current = false;

    if (!editorRef.current || !onUpdate) return;

    // Extract the content and rebuild template + answers
    const lines = Array.from(editorRef.current.querySelectorAll('div'));
    const newAnswers: string[] = [];
    let newTemplate = '';

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) newTemplate += '\n';

      // Get the content span (second child after label)
      const contentSpan = line.querySelector('span.flex-1');
      if (!contentSpan) return;

      // Process children
      contentSpan.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          newTemplate += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.classList.contains('cloze-blank-edit')) {
            newTemplate += '{{blank}}';
            newAnswers.push(sanitizeHTML(el.innerHTML).replace(/<[^>]*>/g, '').trim());
          } else {
            newTemplate += el.textContent || '';
          }
        }
      });
    });

    // Only update if changed
    if (newTemplate !== item.template || JSON.stringify(newAnswers) !== JSON.stringify(item.answers)) {
      onUpdate({ ...item, template: newTemplate, answers: newAnswers });
    }
  }, [item, onUpdate]);

  // Handle input to track changes to blank spans
  const handleInput = useCallback(() => {
    // Debounce could be added here if needed
  }, []);

  return (
    <div
      className="mb-[2mm] p-0 print:break-inside-avoid flex items-baseline"
      data-testid={`cloze-item-${item.id}`}
      data-item-type="CLOZE"
    >
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />

      <div
        ref={editorRef}
        className={`flex-1 text-[11pt] leading-[1.4] ${mode === 'teacher' ? 'editable outline-none' : ''}`}
        contentEditable={mode === 'teacher'}
        suppressContentEditableWarning
        onFocus={mode === 'teacher' ? handleFocus : undefined}
        onBlur={mode === 'teacher' ? handleBlur : undefined}
        onPaste={mode === 'teacher' ? handlePaste : undefined}
        onInput={mode === 'teacher' ? handleInput : undefined}
        data-testid="cloze-template"
      />
    </div>
  );
};