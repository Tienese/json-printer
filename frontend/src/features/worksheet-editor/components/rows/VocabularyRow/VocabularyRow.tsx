/**
 * VocabularyRow component - Term: _______ pairs
 */

import { useWorksheetStore } from '../../../stores/worksheetStore';
import { RowWrapper } from '../RowWrapper';
import type { VocabularyRow as VocabularyRowType } from '../../../types/worksheet';
import styles from './VocabularyRow.module.css';

interface VocabularyRowProps {
  row: VocabularyRowType;
}

export function VocabularyRow({ row }: VocabularyRowProps) {
  const { updateVocabTerm } = useWorksheetStore();

  const handleTermBlur = (index: number, e: React.FocusEvent<HTMLSpanElement>) => {
    const newValue = e.currentTarget.textContent || '';
    updateVocabTerm(row.id, index, 'term', newValue);
  };

  return (
    <RowWrapper rowId={row.id}>
      <div
        className={styles.vocabContainer}
        style={{
          gridTemplateColumns: `repeat(${row.columns}, 1fr)`,
          gap: '0.5rem',
          fontSize: `${row.fontSize || 12}px`,
        }}
      >
        {row.terms.map((term, index) => (
          <div key={term.id} className={styles.vocabItem}>
            <span
              contentEditable
              suppressContentEditableWarning
              className={styles.term}
              data-placeholder="Term"
              onBlur={(e) => handleTermBlur(index, e)}
            >
              {term.term}
            </span>
            <span
              className={`${styles.line} ${row.lineStyle === 'solid' ? styles.solid : styles.dashed}`}
            />
          </div>
        ))}
      </div>
    </RowWrapper>
  );
}
