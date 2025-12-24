/**
 * useGridSections Hook
 * Centralizes section and box CRUD operations for GridItem.
 * All operations are instrumented with devAssert for runtime validation.
 */

import { useCallback } from 'react';
import type { GridItem } from '../types/worksheet';
import { focusGridBox } from '../utils/gridFocus';
import { devAssert } from '../utils/devAssert';

interface UseGridSectionsReturn {
    // Section operations
    insertSection: (refIndex: number, position: 'before' | 'after') => void;
    breakSection: (sectionIndex: number, boxIndex: number) => void;

    // Box operations
    addBox: (sectionIndex: number) => void;
    deleteBox: (sectionIndex: number, boxIndex: number) => void;
    removeEmptyBox: (sectionIndex: number, boxIndex: number) => boolean;

    // Multi-char IME
    multiCommit: (sectionIndex: number, insertIndex: number, chars: string[]) => void;
}

interface SetActiveBoxFn {
    (box: { sectionIndex: number; boxIndex: number } | null): void;
}

export function useGridSections(
    item: GridItem,
    onUpdate: (item: GridItem) => void,
    setActiveBox: SetActiveBoxFn
): UseGridSectionsReturn {
    const itemId = item.id; // Capture item ID for focus scoping

    // Insert a new section before or after the reference section
    const insertSection = useCallback((refIndex: number, position: 'before' | 'after') => {
        const prevSectionCount = item.sections.length;
        const insertIndex = position === 'before' ? refIndex : refIndex + 1;
        const newSection = { id: crypto.randomUUID(), boxes: [{ char: '', furigana: '' }] };
        const newSections = [...item.sections];
        newSections.splice(insertIndex, 0, newSection);

        // Assert: section count should increase by 1
        void devAssert.check('useGridSections', 'INSERT_SECTION', {
            expected: { sectionCount: prevSectionCount + 1 },
            actual: { sectionCount: newSections.length },
            message: `Insert section ${position} index ${refIndex}`,
            snapshot: () => ({ prevSections: item.sections, newSections, insertIndex })
        });

        onUpdate({ ...item, sections: newSections });
        setActiveBox({ sectionIndex: insertIndex, boxIndex: 0 });
        focusGridBox(insertIndex, 0, 'char', 50, itemId);
    }, [item, onUpdate, setActiveBox, itemId]);

    // Break section at current position (plain Enter)
    const breakSection = useCallback((sectionIndex: number, boxIndex: number) => {
        // Do nothing at position 0
        if (boxIndex === 0) return;

        const prevSectionCount = item.sections.length;
        const section = item.sections[sectionIndex];

        // Split boxes
        const beforeBoxes = section.boxes.slice(0, boxIndex);
        const afterBoxes = section.boxes.slice(boxIndex);

        // Create new sections
        const beforeSection = { ...section, boxes: beforeBoxes };
        const afterSection = { id: crypto.randomUUID(), boxes: afterBoxes };

        const newSections = [...item.sections];
        newSections.splice(sectionIndex, 1, beforeSection, afterSection);

        // Assert: section count should increase by 1, boxes split correctly
        void devAssert.check('useGridSections', 'BREAK_SECTION', {
            expected: {
                sectionCount: prevSectionCount + 1,
                beforeBoxCount: boxIndex,
                afterBoxCount: section.boxes.length - boxIndex
            },
            actual: {
                sectionCount: newSections.length,
                beforeBoxCount: beforeSection.boxes.length,
                afterBoxCount: afterSection.boxes.length
            },
            message: `Break section ${sectionIndex} at box ${boxIndex}`,
            snapshot: () => ({ prevSection: section, beforeSection, afterSection })
        });

        onUpdate({ ...item, sections: newSections });

        // Focus first box of new section
        const newSectionIndex = sectionIndex + 1;
        setActiveBox({ sectionIndex: newSectionIndex, boxIndex: 0 });
        focusGridBox(newSectionIndex, 0, 'char', 50, itemId);
    }, [item, onUpdate, setActiveBox, itemId]);

    // Add a new box to the end of a section
    const addBox = useCallback((sectionIndex: number) => {
        const prevBoxCount = item.sections[sectionIndex].boxes.length;

        const newSections = [...item.sections];
        const newBox = { char: '', furigana: '' };
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            boxes: [...newSections[sectionIndex].boxes, newBox]
        };

        const newBoxCount = newSections[sectionIndex].boxes.length;
        const expectedCursor = { sectionIndex, boxIndex: newBoxCount - 1 };

        // Assert: box count should increase by 1
        void devAssert.check('useGridSections', 'ADD_BOX', {
            expected: { boxCount: prevBoxCount + 1, cursor: expectedCursor },
            actual: { boxCount: newBoxCount, cursor: expectedCursor },
            message: `Add box to section ${sectionIndex}`,
            snapshot: () => ({
                prevBoxes: item.sections[sectionIndex].boxes,
                newBoxes: newSections[sectionIndex].boxes
            })
        });

        onUpdate({ ...item, sections: newSections });

        const newBoxIndex = newSections[sectionIndex].boxes.length - 1;
        setActiveBox({ sectionIndex, boxIndex: newBoxIndex });
        focusGridBox(sectionIndex, newBoxIndex, 'char', 50, itemId);
    }, [item, onUpdate, setActiveBox, itemId]);

    // Delete a box (forced, even with content). If last box, delete entire section.
    const deleteBox = useCallback((sectionIndex: number, boxIndex: number) => {
        const section = item.sections[sectionIndex];
        const prevBoxCount = section.boxes.length;
        const prevSectionCount = item.sections.length;

        if (section.boxes.length <= 1) {
            // Last box in section - delete entire section
            if (item.sections.length <= 1) return; // Keep at least one section

            const newSections = item.sections.filter((_, i) => i !== sectionIndex);

            // Assert: section count should decrease by 1
            void devAssert.check('useGridSections', 'DELETE_BOX_SECTION', {
                expected: { sectionCount: prevSectionCount - 1 },
                actual: { sectionCount: newSections.length },
                message: `Delete last box in section ${sectionIndex}, removing section`,
                snapshot: () => ({ deletedSection: section, remainingSections: newSections })
            });

            onUpdate({ ...item, sections: newSections });

            // Focus previous section (or first if deleting first)
            const newFocusSection = Math.max(0, sectionIndex - 1);
            setActiveBox({ sectionIndex: newFocusSection, boxIndex: 0 });
            focusGridBox(newFocusSection, 0, 'char', 50, itemId);
        } else {
            // Delete box, keep section
            const newBoxes = [...section.boxes];
            newBoxes.splice(boxIndex, 1);

            const newSections = [...item.sections];
            newSections[sectionIndex] = { ...section, boxes: newBoxes };

            // Assert: box count should decrease by 1
            void devAssert.check('useGridSections', 'DELETE_BOX', {
                expected: { boxCount: prevBoxCount - 1 },
                actual: { boxCount: newBoxes.length },
                message: `Delete box ${boxIndex} from section ${sectionIndex}`,
                snapshot: () => ({ deletedBox: section.boxes[boxIndex], remainingBoxes: newBoxes })
            });

            onUpdate({ ...item, sections: newSections });

            // Focus previous box (or stay at same index if at start)
            const newIndex = Math.max(0, boxIndex - 1);
            setActiveBox({ sectionIndex, boxIndex: newIndex });
            focusGridBox(sectionIndex, newIndex, 'char', 50, itemId);
        }
    }, [item, onUpdate, setActiveBox, itemId]);

    // Remove the last empty box from a section (if both char and furigana are empty)
    // Returns true if box was removed
    const removeEmptyBox = useCallback((sectionIndex: number, boxIndex: number): boolean => {
        const section = item.sections[sectionIndex];
        // Only remove if it's the last box and it's truly empty
        if (boxIndex !== section.boxes.length - 1) return false;
        if (section.boxes.length <= 1) return false; // Keep at least one box

        const box = section.boxes[boxIndex];
        if (box.char || box.furigana) return false; // Don't remove if has content

        const prevBoxCount = section.boxes.length;

        const newSections = [...item.sections];
        const newBoxes = [...newSections[sectionIndex].boxes];
        newBoxes.pop();
        newSections[sectionIndex] = { ...newSections[sectionIndex], boxes: newBoxes };

        // Assert: box count should decrease by 1
        void devAssert.check('useGridSections', 'REMOVE_EMPTY_BOX', {
            expected: { boxCount: prevBoxCount - 1 },
            actual: { boxCount: newBoxes.length },
            message: `Remove empty box ${boxIndex} from section ${sectionIndex}`,
            snapshot: () => ({ removedBox: box, remainingBoxes: newBoxes })
        });

        onUpdate({ ...item, sections: newSections });

        // Focus the previous box
        const prevBoxIndex = boxIndex - 1;
        setActiveBox({ sectionIndex, boxIndex: prevBoxIndex });
        focusGridBox(sectionIndex, prevBoxIndex, 'char', 50, itemId);
        return true;
    }, [item, onUpdate, setActiveBox, itemId]);

    // Handle multi-character IME confirmation with INSERT-AND-PUSH logic
    const multiCommit = useCallback((sectionIndex: number, insertIndex: number, chars: string[]) => {
        const prevBoxCount = item.sections[sectionIndex].boxes.length;
        const insertCount = chars.length;

        const newSections = [...item.sections];
        const section = newSections[sectionIndex];
        const oldBoxes = [...section.boxes];

        // Build new boxes array with insertion
        const beforeInsert = oldBoxes.slice(0, insertIndex);
        const afterInsert = oldBoxes.slice(insertIndex);
        const insertedBoxes = chars.map(char => ({ char, furigana: '' }));
        const newBoxes = [...beforeInsert, ...insertedBoxes, ...afterInsert];

        newSections[sectionIndex] = { ...section, boxes: newBoxes };

        // Expected cursor: box after the last inserted char
        const expectedCursorIndex = insertIndex + insertCount;

        // Assert: box count should increase by chars.length
        void devAssert.check('useGridSections', 'MULTI_COMMIT', {
            expected: {
                boxCount: prevBoxCount + insertCount,
                insertedChars: chars.join(''),
                cursorIndex: expectedCursorIndex
            },
            actual: {
                boxCount: newBoxes.length,
                insertedChars: insertedBoxes.map(b => b.char).join(''),
                cursorIndex: expectedCursorIndex
            },
            message: `IME insert "${chars.join('')}" at index ${insertIndex}`,
            snapshot: () => ({
                input: { sectionIndex, insertIndex, chars },
                before: oldBoxes.map(b => b.char).join('|'),
                after: newBoxes.map(b => b.char).join('|'),
                cursor: expectedCursorIndex
            })
        });

        onUpdate({ ...item, sections: newSections });

        // Focus the box after the last inserted char
        const nextBoxIndex = insertIndex + insertCount;
        setActiveBox({ sectionIndex, boxIndex: nextBoxIndex });

        if (nextBoxIndex < newBoxes.length) {
            focusGridBox(sectionIndex, nextBoxIndex, 'char', 50, itemId);
        }
    }, [item, onUpdate, setActiveBox, itemId]);

    return {
        insertSection,
        breakSection,
        addBox,
        deleteBox,
        removeEmptyBox,
        multiCommit
    };
}
