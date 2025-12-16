/**
 * GridSection - A section of character boxes with shared properties
 * Controls are in the properties panel, not inline
 */

import { useState } from 'react';
import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { GridSection as GridSectionType } from '../../../types/worksheet';
import { CharacterBox } from './CharacterBox';
import { BOX_SIZES } from '../../../utils/constants';
import styles from './GridSection.module.css';

interface GridSectionProps {
  rowId: string;
  section: GridSectionType;
}

export function GridSection({ rowId, section }: GridSectionProps) {
  const { selectElement } = useWorksheetStore();

  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

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
      {/* Boxes container */}
      <div className={styles.boxesContainer}>
        {section.boxes.length === 0 ? (
          <div className={styles.empty}>No boxes. Add boxes from the properties panel.</div>
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
