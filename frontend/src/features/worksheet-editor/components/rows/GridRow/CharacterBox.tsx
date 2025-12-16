/**
 * CharacterBox - Individual character box with furigana input
 * Supports Japanese characters with ruby text (furigana)
 */

import { useRef, useEffect } from 'react';
import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { CharacterBox as CharacterBoxType } from '../../../types/worksheet';
import { BOX_SIZES } from '../../../utils/constants';
import type { BoxSize } from '../../../types/worksheet';
import styles from './CharacterBox.module.css';

interface CharacterBoxProps {
  rowId: string;
  sectionId: string;
  box: CharacterBoxType;
  boxSize: BoxSize;
  showGuides: boolean;
  isSelected: boolean;
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'tab') => void;
  onSelect: () => void;
}

export function CharacterBox({
  rowId,
  sectionId,
  box,
  boxSize,
  showGuides,
  isSelected,
  onNavigate,
  onSelect,
}: CharacterBoxProps) {
  const { updateBox } = useWorksheetStore();
  const furiganaRef = useRef<HTMLInputElement>(null);
  const characterRef = useRef<HTMLInputElement>(null);

  const boxDimensions = BOX_SIZES[boxSize];
  const sizePx = boxDimensions.px;

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && characterRef.current) {
      characterRef.current.focus();
    }
  }, [isSelected]);

  const handleFuriganaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBox(rowId, sectionId, box.id, 'furigana', e.target.value);
  };

  const handleCharacterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBox(rowId, sectionId, box.id, 'text', e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, input: 'furigana' | 'character') => {
    // Navigation keys
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (input === 'character') {
        // Move to furigana input
        furiganaRef.current?.focus();
      } else {
        // Navigate to previous row
        onNavigate('up');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (input === 'furigana') {
        // Move to character input
        characterRef.current?.focus();
      } else {
        // Navigate to next row
        onNavigate('down');
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNavigate('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNavigate('right');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onNavigate('tab');
    }
  };

  const handleClick = () => {
    onSelect();
  };

  return (
    <div className={`${styles.box} ${isSelected ? styles.selected : ''}`}>
      {/* Furigana input */}
      <input
        ref={furiganaRef}
        type="text"
        value={box.furigana}
        onChange={handleFuriganaChange}
        onKeyDown={(e) => handleKeyDown(e, 'furigana')}
        onClick={handleClick}
        className={styles.furiganaInput}
        style={{ width: `${sizePx}px` }}
        placeholder=""
      />

      {/* Character box */}
      <div
        className={styles.characterContainer}
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
        }}
      >
        <input
          ref={characterRef}
          type="text"
          value={box.text}
          onChange={handleCharacterChange}
          onKeyDown={(e) => handleKeyDown(e, 'character')}
          onClick={handleClick}
          className={styles.characterInput}
          maxLength={2}
          placeholder=""
        />

        {/* Guide lines */}
        {showGuides && (
          <div className={styles.guides}>
            <div className={styles.guideCross} />
          </div>
        )}
      </div>
    </div>
  );
}
