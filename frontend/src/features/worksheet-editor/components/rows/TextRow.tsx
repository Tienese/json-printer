/**
 * TextRow component - REQ-018: Rich text fields
 */

import ContentEditable from 'react-contenteditable';
import { useWorksheetStore } from '../../stores/worksheetStore';
import { RowWrapper } from './RowWrapper';
import type { TextRow as TextRowType } from '../../types/worksheet';
import styles from './TextRow.module.css';

interface TextRowProps {
  row: TextRowType;
}

export function TextRow({ row }: TextRowProps) {
  const { updateRow } = useWorksheetStore();

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    updateRow(row.id, { content: newContent });
  };

  return (
    <RowWrapper rowId={row.id}>
      <ContentEditable
        html={row.content}
        onChange={handleContentChange}
        className={styles.text}
        style={{
          fontSize: `${row.fontSize}pt`,
          fontWeight: row.bold ? 'bold' : 'normal',
          textAlign: row.alignment,
        }}
      />
    </RowWrapper>
  );
}
