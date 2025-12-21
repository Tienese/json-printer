/**
 * useGridSections Hook
 * Centralizes section and box CRUD operations for GridItem.
 */

import { useCallback } from 'react';
import type { GridItem } from '../types/worksheet';
import { focusGridBox } from '../utils/gridFocus';

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

    // Insert a new section before or after the reference section
    const insertSection = useCallback((refIndex: number, position: 'before' | 'after') => {
        const insertIndex = position === 'before' ? refIndex : refIndex + 1;
        const newSection = { id: crypto.randomUUID(), boxes: [{ char: '', furigana: '' }] };
        const newSections = [...item.sections];
        newSections.splice(insertIndex, 0, newSection);
        onUpdate({ ...item, sections: newSections });

        setActiveBox({ sectionIndex: insertIndex, boxIndex: 0 });
        focusGridBox(insertIndex, 0, 'char');
    }, [item, onUpdate, setActiveBox]);

    // Break section at current position (plain Enter)
    const breakSection = useCallback((sectionIndex: number, boxIndex: number) => {
        // Do nothing at position 0
        if (boxIndex === 0) return;

        const section = item.sections[sectionIndex];

        // Split boxes
        const beforeBoxes = section.boxes.slice(0, boxIndex);
        const afterBoxes = section.boxes.slice(boxIndex);

        // Create new sections
        const beforeSection = { ...section, boxes: beforeBoxes };
        const afterSection = { id: crypto.randomUUID(), boxes: afterBoxes };

        const newSections = [...item.sections];
        newSections.splice(sectionIndex, 1, beforeSection, afterSection);
        onUpdate({ ...item, sections: newSections });

        // Focus first box of new section
        const newSectionIndex = sectionIndex + 1;
        setActiveBox({ sectionIndex: newSectionIndex, boxIndex: 0 });
        focusGridBox(newSectionIndex, 0, 'char');
    }, [item, onUpdate, setActiveBox]);

    // Add a new box to the end of a section
    const addBox = useCallback((sectionIndex: number) => {
        const newSections = [...item.sections];
        const newBox = { char: '', furigana: '' };
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            boxes: [...newSections[sectionIndex].boxes, newBox]
        };
        onUpdate({ ...item, sections: newSections });

        const newBoxIndex = newSections[sectionIndex].boxes.length - 1;
        setActiveBox({ sectionIndex, boxIndex: newBoxIndex });
        focusGridBox(sectionIndex, newBoxIndex, 'char');
    }, [item, onUpdate, setActiveBox]);

    // Delete a box (forced, even with content). If last box, delete entire section.
    const deleteBox = useCallback((sectionIndex: number, boxIndex: number) => {
        const section = item.sections[sectionIndex];

        if (section.boxes.length <= 1) {
            // Last box in section - delete entire section
            if (item.sections.length <= 1) return; // Keep at least one section

            const newSections = item.sections.filter((_, i) => i !== sectionIndex);
            onUpdate({ ...item, sections: newSections });

            // Focus previous section (or first if deleting first)
            const newFocusSection = Math.max(0, sectionIndex - 1);
            setActiveBox({ sectionIndex: newFocusSection, boxIndex: 0 });
            focusGridBox(newFocusSection, 0, 'char');
        } else {
            // Delete box, keep section
            const newBoxes = [...section.boxes];
            newBoxes.splice(boxIndex, 1);

            const newSections = [...item.sections];
            newSections[sectionIndex] = { ...section, boxes: newBoxes };
            onUpdate({ ...item, sections: newSections });

            // Focus previous box (or stay at same index if at start)
            const newIndex = Math.max(0, boxIndex - 1);
            setActiveBox({ sectionIndex, boxIndex: newIndex });
            focusGridBox(sectionIndex, newIndex, 'char');
        }
    }, [item, onUpdate, setActiveBox]);

    // Remove the last empty box from a section (if both char and furigana are empty)
    // Returns true if box was removed
    const removeEmptyBox = useCallback((sectionIndex: number, boxIndex: number): boolean => {
        const section = item.sections[sectionIndex];
        // Only remove if it's the last box and it's truly empty
        if (boxIndex !== section.boxes.length - 1) return false;
        if (section.boxes.length <= 1) return false; // Keep at least one box

        const box = section.boxes[boxIndex];
        if (box.char || box.furigana) return false; // Don't remove if has content

        const newSections = [...item.sections];
        const newBoxes = [...newSections[sectionIndex].boxes];
        newBoxes.pop();
        newSections[sectionIndex] = { ...newSections[sectionIndex], boxes: newBoxes };
        onUpdate({ ...item, sections: newSections });

        // Focus the previous box
        const prevBoxIndex = boxIndex - 1;
        setActiveBox({ sectionIndex, boxIndex: prevBoxIndex });
        focusGridBox(sectionIndex, prevBoxIndex, 'char');
        return true;
    }, [item, onUpdate, setActiveBox]);

    // Handle multi-character IME confirmation with INSERT-AND-PUSH logic
    const multiCommit = useCallback((sectionIndex: number, insertIndex: number, chars: string[]) => {
        const newSections = [...item.sections];
        const section = newSections[sectionIndex];
        const oldBoxes = [...section.boxes];
        const insertCount = chars.length;

        // Build new boxes array with insertion
        const beforeInsert = oldBoxes.slice(0, insertIndex);
        const afterInsert = oldBoxes.slice(insertIndex);
        const insertedBoxes = chars.map(char => ({ char, furigana: '' }));
        const newBoxes = [...beforeInsert, ...insertedBoxes, ...afterInsert];

        newSections[sectionIndex] = { ...section, boxes: newBoxes };
        onUpdate({ ...item, sections: newSections });

        // Focus the box after the last inserted char
        const nextBoxIndex = insertIndex + insertCount;
        setActiveBox({ sectionIndex, boxIndex: nextBoxIndex });

        if (nextBoxIndex < newBoxes.length) {
            focusGridBox(sectionIndex, nextBoxIndex, 'char');
        }
    }, [item, onUpdate, setActiveBox]);

    return {
        insertSection,
        breakSection,
        addBox,
        deleteBox,
        removeEmptyBox,
        multiCommit
    };
}
