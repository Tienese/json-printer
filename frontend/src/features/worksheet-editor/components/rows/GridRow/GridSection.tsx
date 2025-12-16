/**
 * GridSection - A section of character boxes with shared properties
 * Supports multiple box sizes and guide line toggles
 */

import { useState } from 'react';
import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { GridSection as GridSectionType } from '../../../types/worksheet';
import type { BoxSize } from '../../../types/worksheet';
import { CharacterBox } from './CharacterBox';
import { BOX_SIZES } from '../../../utils/constants';
import styles from './GridSection.module.css';

interface GridSectionProps {
  rowId: string;
  section: GridSectionType;
}

export function GridSection({ rowId, section }: GridSectionProps) {
  const {
    selectElement,
    updateGridSection,
    deleteGridSection,
    addGridSection,
    changeBoxSize,
    modifyBoxCount,
  } = useWorksheetStore();

  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const handleBoxSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value as BoxSize;
    changeBoxSize(rowId, section.id, newSize);
  };

  const handleToggleGuides = () => {
    updateGridSection(rowId, section.id, { showGuides: !section.showGuides });
  };

  const handleAddBox = () => {
    modifyBoxCount(rowId, section.id, 1);
  };

  const handleRemoveBox = () => {
    if (section.boxes.length > 1) {
      modifyBoxCount(rowId, section.id, -1);
    }
  };

  const handleDeleteSection = () => {
    deleteGridSection(rowId, section.id);
  };

  const handleAddSectionLeft = () => {
    addGridSection(rowId, 'left', section.id);
  };

  const handleAddSectionRight = () => {
    addGridSection(rowId, 'right', section.id);
  };

  const handleBoxSelect = (boxId: string) => {
    setSelectedBoxId(boxId);
    selectElement(rowId, boxId);
  };

  const handleNavigate = (
    boxId: string,
    direction: 'up' | 'down' | 'left' | 'right' | 'tab'
  ) => {
    const currentIndex = section.boxes.findIndex((b) => b.id === boxId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (direction) {
      case 'left':
        nextIndex = currentIndex - 1;
        break;
      case 'right':
      case 'tab':
        nextIndex = currentIndex + 1;
        break;
      case 'up':
        // Calculate boxes per row based on box size
        const boxesPerRow = BOX_SIZES[section.boxSize].maxPerRow;
        nextIndex = currentIndex - boxesPerRow;
        break;
      case 'down':
        const boxesPerRowDown = BOX_SIZES[section.boxSize].maxPerRow;
        nextIndex = currentIndex + boxesPerRowDown;
        break;
    }

    // Clamp to valid range
    if (nextIndex >= 0 && nextIndex < section.boxes.length) {
      const nextBox = section.boxes[nextIndex];
      handleBoxSelect(nextBox.id);
    }
  };

  return (
    <div className={styles.section}>
      {/* Section header with controls */}
      <div className={styles.sectionHeader}>
        <label>
          Box Size:
          <select
            value={section.boxSize}
            onChange={handleBoxSizeChange}
            className={styles.boxSizeSelect}
          >
            <option value="SIZE_8MM">8mm ({BOX_SIZES.SIZE_8MM.maxPerRow}/row)</option>
            <option value="SIZE_10MM">10mm ({BOX_SIZES.SIZE_10MM.maxPerRow}/row)</option>
            <option value="SIZE_12MM">12mm ({BOX_SIZES.SIZE_12MM.maxPerRow}/row)</option>
          </select>
        </label>

        <button
          onClick={handleToggleGuides}
          className={styles.controlBtn}
          title="Toggle guide lines"
        >
          {section.showGuides ? '✓' : '✗'} Guides
        </button>

        <div className={styles.sectionControls}>
          <button onClick={handleAddSectionLeft} className={styles.controlBtn} title="Add section to left">
            ← Section
          </button>
          <button onClick={handleAddSectionRight} className={styles.controlBtn} title="Add section to right">
            Section →
          </button>
          <button onClick={handleAddBox} className={styles.controlBtn} title="Add box">
            + Box
          </button>
          <button
            onClick={handleRemoveBox}
            className={styles.controlBtn}
            disabled={section.boxes.length <= 1}
            title="Remove last box"
          >
            - Box
          </button>
          <button
            onClick={handleDeleteSection}
            className={`${styles.controlBtn} ${styles.deleteBtn}`}
            title="Delete section"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Boxes container */}
      <div className={styles.boxesContainer}>
        {section.boxes.length === 0 ? (
          <div className={styles.empty}>No boxes. Click "+ Box" to add one.</div>
        ) : (
          section.boxes.map((box) => (
            <CharacterBox
              key={box.id}
              rowId={rowId}
              sectionId={section.id}
              box={box}
              boxSize={section.boxSize}
              showGuides={section.showGuides}
              isSelected={selectedBoxId === box.id}
              onNavigate={(direction) => handleNavigate(box.id, direction)}
              onSelect={() => handleBoxSelect(box.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
