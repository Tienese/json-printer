/**
 * VocabularyRow component - Term: Meaning pairs
 * Full implementation in Phase 4
 */

import { RowWrapper } from '../RowWrapper';
import type { VocabularyRow as VocabularyRowType } from '../../../types/worksheet';
import styles from './VocabularyRow.module.css';

interface VocabularyRowProps {
  row: VocabularyRowType;
}

export function VocabularyRow({ row }: VocabularyRowProps) {
  return (
    <RowWrapper rowId={row.id}>
      <div className={styles.vocabRow}>
        <p className={styles.placeholder}>
          📚 Vocabulary Row (Phase 4: Term-meaning pairs)
        </p>
        <p className={styles.info}>
          Terms: {row.terms.length} | Columns: {row.columns} | Style:{' '}
          {row.lineStyle}
        </p>
      </div>
    </RowWrapper>
  );
}
