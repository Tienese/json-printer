/**
 * RowWrapper - Common wrapper with selection and click handling
 */

import type { ReactNode } from 'react';
import { useWorksheetStore } from '../../stores/worksheetStore';
import { usePagination } from '../../hooks/usePagination';
import styles from './RowWrapper.module.css';

interface RowWrapperProps {
  rowId: string;
  children: ReactNode;
}

export function RowWrapper({ rowId, children }: RowWrapperProps) {
  const { selectedRowId, selectRow } = useWorksheetStore();
  const isSelected = selectedRowId === rowId;
  // Use pagination hook to measure row height
  const rowRef = usePagination(rowId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectRow(rowId);
  };

  return (
    <div
      ref={rowRef}
      className={`${styles.wrapper} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      data-row-id={rowId}
    >
      {children}
    </div>
  );
}
