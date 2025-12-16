/**
 * TextProperties - Properties panel for Text rows
 */

import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { TextRow } from '../../../types/worksheet';
import styles from './Properties.module.css';

interface TextPropertiesProps {
    row: TextRow;
}

export function TextProperties({ row }: TextPropertiesProps) {
    const { updateRow, deleteRow } = useWorksheetStore();

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value) || 12;
        updateRow(row.id, { fontSize: Math.min(Math.max(size, 8), 24) });
    };

    const handleBoldToggle = () => {
        updateRow(row.id, { bold: !row.bold });
    };

    const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
        updateRow(row.id, { alignment });
    };

    return (
        <div className={styles.properties}>
            <h3>Text Properties</h3>

            <div className={styles.group}>
                <label>Font Size (pt):</label>
                <input
                    type="number"
                    min="8"
                    max="24"
                    value={row.fontSize}
                    onChange={handleFontSizeChange}
                    className={styles.numberInput}
                />
            </div>

            <div className={styles.group}>
                <label>Style:</label>
                <div className={styles.buttonGroup}>
                    <button
                        className={row.bold ? styles.active : ''}
                        onClick={handleBoldToggle}
                    >
                        <strong>B</strong>
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <label>Alignment:</label>
                <div className={styles.buttonGroup}>
                    <button
                        className={row.alignment === 'left' ? styles.active : ''}
                        onClick={() => handleAlignmentChange('left')}
                    >
                        Left
                    </button>
                    <button
                        className={row.alignment === 'center' ? styles.active : ''}
                        onClick={() => handleAlignmentChange('center')}
                    >
                        Center
                    </button>
                    <button
                        className={row.alignment === 'right' ? styles.active : ''}
                        onClick={() => handleAlignmentChange('right')}
                    >
                        Right
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <button
                    className={styles.deleteBtn}
                    onClick={() => {
                        if (confirm('Delete text row?')) {
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
