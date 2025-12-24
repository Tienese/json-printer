import { useRef, useCallback, useEffect } from 'react';
import type { VocabItem, CharacterBox } from '../types/worksheet';
import { sanitizePaste, sanitizeHTML } from '../utils/htmlSanitizer';
import { CharacterInput } from './CharacterInput';
import { QuestionNumber } from './shared/QuestionNumber';

interface VocabItemProps {
  item: VocabItem;
  onUpdate: (item: VocabItem) => void;
}

export function VocabItemComponent({ item, onUpdate }: VocabItemProps) {
  const termRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const isEditingDescription = useRef(false);
  const editingTermIndex = useRef<number | null>(null);

  // Sync description from props
  useEffect(() => {
    if (descriptionRef.current && document.activeElement !== descriptionRef.current) {
      if (descriptionRef.current.innerHTML !== (item.description || '')) {
        descriptionRef.current.innerHTML = item.description || '';
      }
    }
  }, [item.description]);

  // Sync terms from props
  useEffect(() => {
    item.terms.forEach((term, index) => {
      const el = termRefs.current[index];
      if (el && document.activeElement !== el) {
        if (el.innerHTML !== term.term) {
          el.innerHTML = term.term;
        }
      }
    });
  }, [item.terms]);

  const handleTermChange = useCallback((index: number, value: string) => {
    const newTerms = [...item.terms];
    newTerms[index] = { ...newTerms[index], term: value };
    onUpdate({ ...item, terms: newTerms });
  }, [item, onUpdate]);

  const handleDescriptionBlur = useCallback(() => {
    isEditingDescription.current = false;
    if (descriptionRef.current) {
      const cleaned = sanitizeHTML(descriptionRef.current.innerHTML);
      if (cleaned !== item.description) {
        onUpdate({ ...item, description: cleaned });
      }
    }
  }, [item, onUpdate]);

  // Handle paste with HTML sanitization
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const cleaned = sanitizePaste(e.nativeEvent as ClipboardEvent);
    document.execCommand('insertHTML', false, cleaned);
  }, []);

  const termTimeouts = useRef<{ [key: number]: any }>({});

  const handleTermInput = useCallback((index: number) => {
    // Clear existing timeout
    if (termTimeouts.current[index]) {
      clearTimeout(termTimeouts.current[index]);
    }

    // Set new timeout for 500ms
    termTimeouts.current[index] = setTimeout(() => {
      if (termRefs.current[index]) {
        const cleaned = sanitizeHTML(termRefs.current[index]!.innerHTML);
        if (cleaned !== item.terms[index].term) {
          const newTerms = [...item.terms];
          newTerms[index] = { ...newTerms[index], term: cleaned };
          onUpdate({ ...item, terms: newTerms });
        }
      }
    }, 500);
  }, [item, onUpdate]);

  // Handle blur - immediate save
  const handleTermBlur = useCallback((index: number) => {
    // Clear pending debounce since we are saving now
    if (termTimeouts.current[index]) {
      clearTimeout(termTimeouts.current[index]);
    }

    editingTermIndex.current = null;
    if (termRefs.current[index]) {
      const cleaned = sanitizeHTML(termRefs.current[index]!.innerHTML);
      if (cleaned !== item.terms[index].term) {
        handleTermChange(index, cleaned);
      }
    }
  }, [handleTermChange, item.terms]);

  // Handle grid box character change - persist to gridBoxes array
  const handleGridBoxChange = useCallback((termIndex: number, boxIndex: number, value: string) => {
    const newTerms = [...item.terms];
    const term = newTerms[termIndex];
    const boxCount = term.gridBoxCount || 5;

    // Initialize gridBoxes if needed
    const boxes: CharacterBox[] = [...(term.gridBoxes || Array(boxCount).fill(null).map(() => ({ char: '', furigana: '' })))];

    // Ensure array is correct length
    while (boxes.length < boxCount) {
      boxes.push({ char: '', furigana: '' });
    }

    boxes[boxIndex] = { ...boxes[boxIndex], char: value };
    newTerms[termIndex] = { ...term, gridBoxes: boxes };
    onUpdate({ ...item, terms: newTerms });
  }, [item, onUpdate]);

  return (
    <div className="flex items-baseline">
      <QuestionNumber
        number={item.promptNumber!}
        show={item.showPromptNumber && !!item.promptNumber}
      />
      <div className="flex-1">
        <div
          ref={descriptionRef}
          className="editable editable-placeholder mb-[2mm] text-[11pt] leading-[1.4] p-[2px] rounded"
          data-placeholder="Click to add description..."
          contentEditable
          suppressContentEditableWarning
          onFocus={() => { isEditingDescription.current = true; }}
          onBlur={handleDescriptionBlur}
          onPaste={handlePaste}
        />
        <div
          className="grid gap-0 pt-0 text-[var(--vocab-font-size)]"
          style={{
            gridTemplateColumns: `repeat(${item.columns}, 1fr)`,
            '--vocab-font-size': `${item.fontSize}pt`,
          } as React.CSSProperties}
        >
          {(() => {
            // Build per-style counters
            const styleCounters: Record<string, number> = {};

            // Global grid settings
            const globalGridBoxSize = item.gridBoxSize || '10mm';
            const globalGridLayout = item.gridLayout || 'inline';
            const globalShowFurigana = item.gridShowFurigana || false;
            const globalShowGuides = item.gridShowGuides || false;
            const boxSizeMm = parseInt(globalGridBoxSize) || 10;
            const furiganaHeightMm = globalShowFurigana ? Math.floor(boxSizeMm * 0.4) : 0;

            return item.terms.map((term, index) => {
              const style = term.listStyleOverride || item.listStyle || 'number';

              // Initialize or increment counter for this style
              styleCounters[style] = (styleCounters[style] || 0) + 1;
              const styleIndex = styleCounters[style] - 1; // 0-based

              let label = '';
              if (style === 'number') label = `${styleIndex + 1}.`;
              else if (style === 'letter') label = `${String.fromCharCode(97 + styleIndex)}.`;
              else if (style === 'roman') {
                const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                label = `${romanArr[styleIndex] || styleIndex + 1}.`;
              } else if (style === 'bullet') label = '•';
              else if (style === 'vd') label = 'Vd.';
              else if (style === 'example') label = '例.';
              else if (style === 'none') label = '';

              const isGridType = term.termType === 'grid';
              const boxCount = term.gridBoxCount || 5;
              const showTerm = term.showTerm !== false;
              const showTrailingLine = term.showTrailingLine !== false;

              return (
                <div key={term.id || index} className="flex items-baseline flex-grow min-w-0" style={{ fontSize: `${item.fontSize}pt` }}>
                  <span className="mr-1 text-gray-700 font-medium select-none">{label}</span>

                  {isGridType ? (
                    // Grid layout: [bullet] [grid] [term] [dashline]
                    <div className={`flex ${globalGridLayout === 'below' ? 'flex-col' : 'flex-row items-baseline'} gap-2 flex-1`}>
                      {/* Grid boxes first */}
                      <div className="flex flex-col">
                        <div className="flex">
                          {Array.from({ length: boxCount }).map((_, boxIdx) => (
                            <div key={boxIdx} className="flex flex-col relative"
                              style={{ width: `${boxSizeMm}mm` }}>
                              {globalShowFurigana && (
                                <input
                                  className="w-full text-center text-[8pt] border-none outline-none leading-none text-gray-600 bg-transparent m-0 p-0"
                                  style={{ height: `${furiganaHeightMm}mm` }}
                                />
                              )}
                              {/* Unified grid-box styling */}
                              <div
                                className="grid-box"
                                style={{
                                  width: `${boxSizeMm}mm`,
                                  height: `${boxSizeMm}mm`,
                                  fontSize: `${boxSizeMm * 0.7}mm`
                                }}
                              >
                                {/* Guide Lines - same as GridItem */}
                                {globalShowGuides && (
                                  <>
                                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none z-0" />
                                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-300 pointer-events-none z-0" />
                                  </>
                                )}
                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                  <CharacterInput
                                    value={term.gridBoxes?.[boxIdx]?.char || ''}
                                    onCommit={(newChar) => handleGridBoxChange(index, boxIdx, newChar)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Term label after grid */}
                      {showTerm && (
                        <div
                          ref={(el) => { termRefs.current[index] = el; }}
                          className="editable px-[5px] py-[2px] whitespace-nowrap shrink-0 min-w-[5mm]"
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => { editingTermIndex.current = index; }}
                          onBlur={() => handleTermBlur(index)}
                          onInput={() => handleTermInput(index)}
                          onPaste={handlePaste}
                        ></div>
                      )}

                      {/* Trailing dashline */}
                      {showTrailingLine && (
                        <div className="flex-1 border-b border-dashed border-black min-w-[1cm] mr-3"></div>
                      )}
                    </div>
                  ) : (
                    // Text layout with dashline - supports inline/below
                    <div className={`flex ${(term.termLayout || 'inline') === 'below' ? 'flex-col gap-1' : 'flex-row items-baseline'} flex-1`}>
                      {showTerm && (
                        <div
                          ref={(el) => { termRefs.current[index] = el; }}
                          className="editable mr-2 px-[5px] py-[2px] whitespace-nowrap shrink-0 min-w-[5mm]"
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => { editingTermIndex.current = index; }}
                          onBlur={() => handleTermBlur(index)}
                          onInput={() => handleTermInput(index)}
                          onPaste={handlePaste}
                        ></div>
                      )}
                      {showTrailingLine && (
                        <div className="flex-1 border-b border-dashed border-black min-w-[1cm] mr-3"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
