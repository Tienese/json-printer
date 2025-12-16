/**
 * Grid Layout Calculator
 * Calculates section widths and line layouts for multi-line grid arrangement
 */

import { BOX_SIZES, USABLE_WIDTH_MM, MM_TO_PX } from './constants';
import type { GridSection, BoxSize } from '../types/worksheet';

// Layout constants
export const SECTION_GAP_PX = 4; // Gap between sections on the same line
export const BOX_BORDER_PX = 1; // Border width for each box
export const BOX_MARGIN_PX = 2; // Margin between boxes

// Usable width in pixels for calculating line capacity
export const USABLE_WIDTH_PX = USABLE_WIDTH_MM * MM_TO_PX;

/**
 * Calculate the width of a section in pixels
 * Width = (boxCount * boxSize) + (boxCount - 1) * boxMargin + 2 * border + padding
 */
export function calculateSectionWidth(
  boxCount: number,
  boxSize: BoxSize
): number {
  const boxPx = BOX_SIZES[boxSize].px;
  const boxesWidth = boxCount * boxPx;
  const marginsWidth = (boxCount - 1) * BOX_MARGIN_PX;
  const bordersWidth = 2 * BOX_BORDER_PX;
  const padding = 8; // Container padding
  return boxesWidth + marginsWidth + bordersWidth + padding;
}

/**
 * Calculate the total width of a section including its gap
 */
export function calculateSectionWithGap(
  boxCount: number,
  boxSize: BoxSize,
  isLast: boolean
): number {
  const sectionWidth = calculateSectionWidth(boxCount, boxSize);
  return isLast ? sectionWidth : sectionWidth + SECTION_GAP_PX;
}

export interface LineLayout {
  sectionIds: string[];
  totalWidth: number;
}

/**
 * Calculate how sections should be arranged into lines
 * Each line fills up to the usable width, then flows to the next line
 */
export function calculateLineLayout(sections: GridSection[]): LineLayout[] {
  if (sections.length === 0) {
    return [];
  }

  const lines: LineLayout[] = [];
  let currentLine: LineLayout = { sectionIds: [], totalWidth: 0 };

  for (const section of sections) {
    const sectionWidth = calculateSectionWidth(section.boxes.length, section.boxSize);
    const widthWithGap = currentLine.sectionIds.length > 0
      ? sectionWidth + SECTION_GAP_PX
      : sectionWidth;

    // Check if section fits on current line
    if (currentLine.totalWidth + widthWithGap <= USABLE_WIDTH_PX) {
      currentLine.sectionIds.push(section.id);
      currentLine.totalWidth += widthWithGap;
    } else {
      // Start a new line
      if (currentLine.sectionIds.length > 0) {
        lines.push(currentLine);
      }
      currentLine = {
        sectionIds: [section.id],
        totalWidth: sectionWidth
      };
    }
  }

  // Add the last line
  if (currentLine.sectionIds.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Check if a section can fit on the given line
 */
export function canFitOnLine(
  currentLineWidth: number,
  boxCount: number,
  boxSize: BoxSize,
  isFirstOnLine: boolean
): boolean {
  const sectionWidth = calculateSectionWidth(boxCount, boxSize);
  const widthWithGap = isFirstOnLine ? sectionWidth : sectionWidth + SECTION_GAP_PX;
  return currentLineWidth + widthWithGap <= USABLE_WIDTH_PX;
}

/**
 * Get remaining width available on a line
 */
export function getRemainingWidth(currentLineWidth: number): number {
  return Math.max(0, USABLE_WIDTH_PX - currentLineWidth);
}

/**
 * Get the line index for a given section
 */
export function getLineIndexForSection(
  sections: GridSection[],
  sectionId: string
): number {
  const lines = calculateLineLayout(sections);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].sectionIds.includes(sectionId)) {
      return i;
    }
  }
  return -1;
}

/**
 * Find the drop position for a section being dragged
 * Returns the index in the sections array where the dragged section should be inserted
 */
export function findDropPosition(
  sections: GridSection[],
  draggedSectionId: string,
  dropTargetSectionId: string,
  dropPosition: 'before' | 'after'
): number {
  const targetIndex = sections.findIndex((s) => s.id === dropTargetSectionId);
  if (targetIndex === -1) return sections.length;

  const draggedIndex = sections.findIndex((s) => s.id === draggedSectionId);
  const adjustedIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;

  // Adjust if we're moving from before to after the target
  if (draggedIndex !== -1 && draggedIndex < adjustedIndex) {
    return adjustedIndex - 1;
  }

  return adjustedIndex;
}
