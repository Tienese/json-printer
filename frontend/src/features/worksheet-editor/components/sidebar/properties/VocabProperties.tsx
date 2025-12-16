/**
 * VocabProperties - Properties panel for Vocabulary rows
 */

import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { VocabularyRow } from '../../../types/worksheet';
import styles from './Properties.module.css';

interface VocabPropertiesProps {
    row: VocabularyRow;
}

export function VocabProperties({ row }: VocabPropertiesProps) {
    const { setVocabColumns, setVocabLineStyle, setVocabFontSize, addVocabTerm, removeVocabTerm, deleteRow } =
        useWorksheetStore();

    return (
        <div className={styles.properties}>
            <h3>Vocabulary Properties</h3>

            <div className={styles.group}>
                <label>Columns:</label>
                <div className={styles.buttonGroup}>
                    <button
                        className={row.columns === 1 ? styles.active : ''}
                        onClick={() => setVocabColumns(row.id, 1)}
                    >
                        1
                    </button>
                    <button
                        className={row.columns === 2 ? styles.active : ''}
                        onClick={() => setVocabColumns(row.id, 2)}
                    >
                        2
                    </button>
                    <button
                        className={row.columns === 3 ? styles.active : ''}
                        onClick={() => setVocabColumns(row.id, 3)}
                    >
                        3
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <label>Line Style:</label>
                <div className={styles.buttonGroup}>
                    <button
                        className={row.lineStyle === 'dashed' ? styles.active : ''}
                        onClick={() => setVocabLineStyle(row.id, 'dashed')}
                    >
                        Dashed
                    </button>
                    <button
                        className={row.lineStyle === 'solid' ? styles.active : ''}
                        onClick={() => setVocabLineStyle(row.id, 'solid')}
                    >
                        Solid
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <label>Font Size (pt):</label>
                <input
                    type="number"
                    min="8"
                    max="24"
                    value={row.fontSize || 12}
                    onChange={(e) => setVocabFontSize(row.id, parseInt(e.target.value) || 12)}
                    className={styles.numberInput}
                />
            </div>

            <div className={styles.group}>
                <label>Terms: {row.terms.length}</label>
                <div className={styles.buttonGroup}>
                    <button onClick={() => addVocabTerm(row.id)}>+ Add Term</button>
                    <button
                        onClick={() => {
                            if (row.terms.length > 1) {
                                removeVocabTerm(row.id, row.terms.length - 1);
                            }
                        }}
                        disabled={row.terms.length <= 1}
                    >
                        - Remove Last
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <button
                    className={styles.deleteBtn}
                    onClick={() => {
                        if (confirm('Delete vocabulary row?')) {
                            deleteRow(row.id);
                        }
                    }}
                >
                    Delete Row
                </button>
            </div>
        </div>
    );
}
