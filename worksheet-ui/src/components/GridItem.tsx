import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { CharacterInput } from './CharacterInput';
import type { GridItem, GridSection } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';
import { focusGridBox, focusGridBoxFromEvent } from '../utils/gridFocus';
import { useGridSections } from '../hooks/useGridSections';
import { QuestionNumber } from './shared/QuestionNumber';

// Compute merged lines for print optimization
function computeMergedLines(sections: GridSection[], boxSizeMm: number): GridSection[][] {
  const GAP_MM = 2;
  const PRINTABLE_WIDTH = 180; // A4 width (210mm) - margins (30mm)

  const lines: GridSection[][] = [];
  let currentLine: GridSection[] = [];
  let currentWidth = 0;

  for (const section of sections) {
    const sectionWidth = section.boxes.length * boxSizeMm;
    const widthWithGap = currentLine.length > 0 ? sectionWidth + GAP_MM : sectionWidth;

    if (currentWidth + widthWithGap <= PRINTABLE_WIDTH) {
      currentLine.push(section);
      currentWidth += widthWithGap;
    } else {
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = [section];
      currentWidth = sectionWidth;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

interface GridItemProps {
  item: GridItem;
  isSelected?: boolean;
  onUpdate: (item: GridItem) => void;
}

/**
 * Render and manage an interactive grid for a single worksheet item with per-box editing, optional furigana, and keyboard navigation.
 *
 * The component synchronizes an editable description, maintains focused/active box state, handles keyboard navigation (arrow keys, Tab, Enter/Ctrl+Enter for section insertion, Ctrl+Backspace for box deletion), advances/retreats between boxes (creating or removing boxes as needed), sanitizes pasted description content, and calls `onUpdate` with an updated `item` whenever sections, boxes, or the description change. Layout wraps sections into printable lines according to the configured box size.
 *
 * @param item - The grid item data (sections, boxes, presentation settings, description, id, etc.).
 * @param isSelected - When true the description and boxes become editable and keyboard interactions are active.
 * @param onUpdate - Callback invoked with the updated `item` whenever the component modifies sections, boxes, or description.
 * @returns The rendered grid item element.
 */
export function GridItemComponent({ item, isSelected, onUpdate }: GridItemProps) {
  const [activeBox, setActiveBox] = useState<{ sectionIndex: number; boxIndex: number } | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const isEditingDescription = useRef(false);

  // Use extracted hook for section/box operations
  const {
    insertSection,
    breakSection,
    addBox,
    deleteBox,
    removeEmptyBox,
    multiCommit
  } = useGridSections(item, onUpdate, setActiveBox);

  // Sync description from props ONLY if not currently editing
  useEffect(() => {
    if (descriptionRef.current && !isEditingDescription.current) {
      if (descriptionRef.current.innerHTML !== (item.description || '')) {
        descriptionRef.current.innerHTML = item.description || '';
      }
    }
  }, [item.description]);

  // Clear active box when item is deselected
  useEffect(() => {
    if (!isSelected) {
      setActiveBox(null);
    }
  }, [isSelected]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, sectionIndex: number, boxIndex: number, isFurigana: boolean = false) => {
    if (!isSelected) return;

    const currentSection = activeBox?.sectionIndex ?? sectionIndex;
    const currentBox = activeBox?.boxIndex ?? boxIndex;
    const section = item.sections[currentSection];
    if (!section) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentBox > 0) {
          setActiveBox({ sectionIndex: currentSection, boxIndex: currentBox - 1 });
          focusGridBoxFromEvent(e, currentSection, currentBox - 1, isFurigana ? 'furigana' : 'char');
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentBox < section.boxes.length - 1) {
          setActiveBox({ sectionIndex: currentSection, boxIndex: currentBox + 1 });
          focusGridBoxFromEvent(e, currentSection, currentBox + 1, isFurigana ? 'furigana' : 'char');
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isFurigana && item.showFurigana) {
          focusGridBoxFromEvent(e, currentSection, currentBox, 'furigana');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isFurigana) {
          focusGridBoxFromEvent(e, currentSection, currentBox, 'char');
        }
        break;
      case 'Tab':
        e.preventDefault();
        const nextSectionIndex = e.shiftKey ? currentSection - 1 : currentSection + 1;
        if (nextSectionIndex >= 0 && nextSectionIndex < item.sections.length) {
          setActiveBox({ sectionIndex: nextSectionIndex, boxIndex: 0 });
          focusGridBoxFromEvent(e, nextSectionIndex, 0, isFurigana ? 'furigana' : 'char');
        }
        break;
      case 'Enter':
        if (e.ctrlKey) {
          e.preventDefault();
          insertSection(currentSection, e.shiftKey ? 'before' : 'after');
        }
        break;
      case 'Backspace':
        if (e.ctrlKey) {
          e.preventDefault();
          deleteBox(currentSection, currentBox);
        }
        break;
    }
  }, [isSelected, item.sections, item.showFurigana, activeBox, insertSection, deleteBox]);

  // Clear active box when focus leaves the grid entirely
  const handleBoxBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const gridContainer = e.currentTarget.closest('[data-grid-container]');

    if (!gridContainer?.contains(relatedTarget)) {
      setActiveBox(null);
    }
  }, []);

  // Simple box content change handlers
  const handleBoxChange = useCallback((sectionIndex: number, boxIndex: number, value: string) => {
    const newSections = [...item.sections];
    const newBoxes = [...newSections[sectionIndex].boxes];
    newBoxes[boxIndex] = { ...newBoxes[boxIndex], char: value };
    newSections[sectionIndex] = { ...newSections[sectionIndex], boxes: newBoxes };
    onUpdate({ ...item, sections: newSections });
  }, [item, onUpdate]);

  const handleFuriganaChange = useCallback((sectionIndex: number, boxIndex: number, value: string) => {
    const newSections = [...item.sections];
    const newBoxes = [...newSections[sectionIndex].boxes];
    newBoxes[boxIndex] = { ...newBoxes[boxIndex], furigana: value };
    newSections[sectionIndex] = { ...newSections[sectionIndex], boxes: newBoxes };
    onUpdate({ ...item, sections: newSections });
  }, [item, onUpdate]);

  // Advance to next box (or create new if at end)
  const handleAdvance = useCallback((sectionIndex: number, boxIndex: number, isFurigana: boolean) => {
    const section = item.sections[sectionIndex];
    const isAtEnd = boxIndex >= section.boxes.length - 1;

    if (isAtEnd) {
      addBox(sectionIndex);
    } else {
      const nextBox = boxIndex + 1;
      setActiveBox({ sectionIndex, boxIndex: nextBox });
      focusGridBox(sectionIndex, nextBox, isFurigana ? 'furigana' : 'char', 0, item.id);
    }
  }, [item.sections, item.id, addBox]);

  // Retreat to previous box (or delete current if empty at end)
  const handleRetreat = useCallback((sectionIndex: number, boxIndex: number, isFurigana: boolean) => {
    const section = item.sections[sectionIndex];
    const box = section.boxes[boxIndex];
    const isAtEnd = boxIndex === section.boxes.length - 1;
    const isEmpty = !box.char && !box.furigana;

    if (isAtEnd && isEmpty && section.boxes.length > 1) {
      removeEmptyBox(sectionIndex, boxIndex);
    } else if (boxIndex > 0) {
      const prevBox = boxIndex - 1;
      setActiveBox({ sectionIndex, boxIndex: prevBox });
      focusGridBox(sectionIndex, prevBox, isFurigana ? 'furigana' : 'char', 0, item.id);
    }
  }, [item.sections, item.id, removeEmptyBox]);

  // Handle furigana keydown for spacebar advance and backspace retreat
  const handleFuriganaKeyDown = useCallback((e: React.KeyboardEvent, sectionIndex: number, boxIndex: number) => {
    const box = item.sections[sectionIndex]?.boxes[boxIndex];

    if (e.key === ' ') {
      e.preventDefault();
      handleAdvance(sectionIndex, boxIndex, true);
    } else if (e.key === 'Backspace' && !box?.furigana) {
      e.preventDefault();
      handleRetreat(sectionIndex, boxIndex, true);
    } else {
      handleKeyDown(e, sectionIndex, boxIndex, true);
    }
  }, [item.sections, handleAdvance, handleRetreat, handleKeyDown]);

  // Description editing handlers
  const handleDescriptionBlur = useCallback(() => {
    isEditingDescription.current = false;
    if (descriptionRef.current) {
      const cleaned = sanitizeHTML(descriptionRef.current.innerHTML);
      if (cleaned !== item.description) {
        onUpdate({ ...item, description: cleaned });
      }
    }
  }, [item, onUpdate]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertHTML', false, cleaned);
  }, []);

  // Computed values
  const getBoxSizeValue = (size: string) => parseInt(size) || 10;
  const boxSizeMm = getBoxSizeValue(item.boxSize);
  const furiganaHeightMm = item.showFurigana ? Math.floor(boxSizeMm * 0.4) : 0;
  const mergedLines = useMemo(
    () => computeMergedLines(item.sections, boxSizeMm),
    [item.sections, boxSizeMm]
  );


  return (
    <div className="flex flex-col" data-grid-container data-grid-id={item.id}>
      {/* Question Number + Description Row */}
      <div className="flex items-baseline mb-1">
        <QuestionNumber
          number={item.promptNumber!}
          customLabel={item.customLabel}
          show={(item.showPromptNumber ?? true) && item.promptNumber !== undefined}
          className="leading-[1]"
        />
        {isSelected && (
          <div
            ref={descriptionRef}
            className="flex-1 p-1 border-b border-dashed border-gray-300 focus:bg-blue-50 outline-none print:hidden text-sm min-h-[1.2em]"
            contentEditable
            suppressContentEditableWarning
            onFocus={() => { isEditingDescription.current = true; }}
            onBlur={handleDescriptionBlur}
            onPaste={(e) => { e.preventDefault(); handlePaste(e); }}
            data-placeholder="Describe this grid (optional)"
          />
        )}
        {!isSelected && item.description && (
          <span className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: item.description }} />
        )}
      </div>

      <div className="flex-1 print:flex print:flex-col">


        {/* Grid Lines */}
        <div
          className="flex flex-col gap-y-2"
          style={{
            alignItems: item.alignment === 'center' ? 'center' : item.alignment === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          {mergedLines.map((line, lineIndex) => {
            // Calculate global section index for merged lines
            let globalSectionStartIndex = 0;
            for (let i = 0; i < lineIndex; i++) {
              globalSectionStartIndex += mergedLines[i].length;
            }

            return (
              <div key={lineIndex} className="flex gap-x-2 items-end print:gap-x-1">
                {line.map((section, sectionInLineIndex) => {
                  const globalSectionIndex = globalSectionStartIndex + sectionInLineIndex;

                  return (
                    <div
                      key={section.id}
                      className="flex items-end"
                      style={{ gap: 0 }}
                    >
                      {section.boxes.map((box, bIndex) => {
                        const isActive = activeBox?.sectionIndex === globalSectionIndex && activeBox?.boxIndex === bIndex;
                        return (
                          <div
                            key={bIndex}
                            className="flex flex-col relative"
                            style={{ width: `${boxSizeMm}mm` }}
                            onFocus={() => setActiveBox({ sectionIndex: globalSectionIndex, boxIndex: bIndex })}
                            onBlur={handleBoxBlur}
                          >
                            {/* Furigana Row */}
                            {item.showFurigana && (
                              <input
                                className="text-center border-none outline-none leading-none text-gray-600 bg-transparent m-0 p-0 print:text-black"
                                style={{ height: `${furiganaHeightMm}mm`, width: '100%', fontSize: item.furiganaFontSize || '6pt' }}
                                value={box.furigana || ''}
                                onChange={(e) => handleFuriganaChange(globalSectionIndex, bIndex, e.target.value)}
                                onKeyDown={(e) => handleFuriganaKeyDown(e, globalSectionIndex, bIndex)}
                                data-section={globalSectionIndex}
                                data-box={bIndex}
                                data-type="furigana"
                              />
                            )}

                            {/* Character Box */}
                            <div
                              className={`box-border -mr-px -mb-px bg-white flex items-center justify-center font-sans leading-none cursor-text outline-none relative ${isActive ? 'ring-2 ring-gray-400 z-20 print:ring-0' : 'z-0'} ${item.hideBorderOnContent && box.char && box.char.trim() !== '' ? 'border-transparent' : 'border border-black'}`}
                              style={{
                                width: `${boxSizeMm}mm`,
                                height: `${boxSizeMm}mm`,
                                fontSize: `${boxSizeMm * 0.75}mm`
                              }}
                              data-section={globalSectionIndex}
                              data-box={bIndex}
                              data-type="char"
                            >
                              {/* Guide Lines */}
                              {item.showGuides && (
                                <>
                                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none z-0" />
                                  <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-300 pointer-events-none z-0" />
                                </>
                              )}

                              <div
                                className="relative z-10 w-full h-full flex items-center justify-center"
                                onKeyDown={(e) => handleKeyDown(e, globalSectionIndex, bIndex, false)}
                              >
                                <CharacterInput
                                  value={box.char || ''}
                                  onCommit={(newChar) => handleBoxChange(globalSectionIndex, bIndex, newChar)}
                                  onMultiCommit={(chars) => multiCommit(globalSectionIndex, bIndex, chars)}
                                  onAdvance={() => handleAdvance(globalSectionIndex, bIndex, false)}
                                  onRetreat={() => handleRetreat(globalSectionIndex, bIndex, false)}
                                  onSectionBreak={() => breakSection(globalSectionIndex, bIndex)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}