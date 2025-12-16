/**
 * LayerItem - Individual layer in the layers panel
 * Supports drag-and-drop reordering and double-click rename
 */

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWorksheetStore } from '../../stores/worksheetStore';
import type { WorksheetRow } from '../../types/worksheet';
import styles from './LayersPanel.module.css';

interface LayerItemProps {
  row: WorksheetRow;
}

// Icons for different row types
const ROW_ICONS = {
  HEADER: '📋',
  TEXT: '📝',
  GRID: '🔤',
  VOCABULARY: '📚',
} as const;

// Labels for row types
const ROW_TYPE_LABELS = {
  HEADER: 'Header',
  TEXT: 'Text',
  GRID: 'Grid',
  VOCABULARY: 'Vocabulary',
} as const;

export function LayerItem({ row }: LayerItemProps) {
  const { selectedRowId, selectRow, deleteRow, duplicateRow, renameRow } = useWorksheetStore();
  const isSelected = selectedRowId === row.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    selectRow(row.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRow(row.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateRow(row.id);
  };

  // Get default label based on row type (without numbering)
  const getDefaultLabel = () => {
    switch (row.type) {
      case 'HEADER':
        return row.title || 'Untitled Header';
      case 'TEXT':
        // Strip HTML tags for display
        const text = row.content.replace(/<[^>]*>/g, '');
        return text || 'Empty Text';
      case 'GRID':
        const totalBoxes = row.sections.reduce((sum, s) => sum + s.boxes.length, 0);
        return `Grid (${row.sections.length} sections, ${totalBoxes} boxes)`;
      case 'VOCABULARY':
        return `Vocabulary (${row.terms.length} terms)`;
    }
  };

  // Display name: custom name if set, otherwise default label
  const displayName = row.name || getDefaultLabel();

  // Double-click to enter edit mode
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(row.name || getDefaultLabel());
    setIsEditing(true);
  };

  // Save on blur
  const handleInputBlur = () => {
    setIsEditing(false);
    if (editName.trim()) {
      renameRow(row.id, editName.trim());
    }
  };

  // Handle keyboard in edit mode
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.layerItem} ${isSelected ? styles.selected : ''} ${
        isDragging ? styles.dragging : ''
      }`}
      onClick={handleClick}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        ⋮⋮
      </div>

      {/* Row type icon */}
      <div className={styles.layerIcon}>{ROW_ICONS[row.type]}</div>

      {/* Layer content */}
      <div className={styles.layerContent} onDoubleClick={handleDoubleClick}>
        <div className={styles.layerType}>
          {ROW_TYPE_LABELS[row.type]}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={styles.layerNameInput}
          />
        ) : (
          <div className={styles.layerLabel}>{displayName}</div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.layerActions}>
        <button
          onClick={handleDuplicate}
          className={styles.actionBtn}
          title="Duplicate row"
        >
          Copy
        </button>
        <button
          onClick={handleDelete}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          title="Delete row"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
