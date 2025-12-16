/**
 * GridRow component - Japanese character boxes with furigana
 * Full implementation in Phase 4
 */

import { RowWrapper } from '../RowWrapper';
import type { GridRow as GridRowType } from '../../../types/worksheet';
import styles from './GridRow.module.css';

interface GridRowProps {
  row: GridRowType;
}

export function GridRow({ row }: GridRowProps) {
  return (
    <RowWrapper rowId={row.id}>
      <div className={styles.gridRow}>
        <p className={styles.placeholder}>
          📏 Grid Row (Phase 4: Character boxes with furigana)
        </p>
        <p className={styles.info}>
          Sections: {row.sections.length} | Total boxes:{' '}
          {row.sections.reduce((sum, s) => sum + s.boxes.length, 0)}
        </p>
      </div>
    </RowWrapper>
  );
}
