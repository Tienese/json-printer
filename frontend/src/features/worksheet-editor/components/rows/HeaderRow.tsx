/**
 * HeaderRow component - Displays date/name fields and optional title
 */

import ContentEditable from 'react-contenteditable';
import { useWorksheetStore } from '../../stores/worksheetStore';
import { RowWrapper } from './RowWrapper';
import type { HeaderRow as HeaderRowType } from '../../types/worksheet';
import styles from './HeaderRow.module.css';

interface HeaderRowProps {
  row: HeaderRowType;
}

export function HeaderRow({ row }: HeaderRowProps) {
  const { updateRow } = useWorksheetStore();

  const handleTitleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || '';
    updateRow(row.id, { title: newTitle });
  };

  return (
    <RowWrapper rowId={row.id}>
      <div className={styles.header}>
        <div className={styles.headerLine}>
          {row.showDate && (
            <div className={styles.field}>日付: __________________</div>
          )}
          {row.showName && (
            <div className={styles.field}>名前: __________________</div>
          )}
        </div>
        {row.title !== undefined && (
          <ContentEditable
            html={row.title}
            onChange={handleTitleChange}
            className={styles.title}
            tagName="h2"
          />
        )}
      </div>
    </RowWrapper>
  );
}
