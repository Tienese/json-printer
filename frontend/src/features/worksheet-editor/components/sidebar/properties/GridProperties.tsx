/**
 * GridProperties - Properties panel for Grid rows
 */

import { useWorksheetStore } from '../../../stores/worksheetStore';
import type { GridRow, BoxSize } from '../../../types/worksheet';
import styles from './Properties.module.css';

interface GridPropertiesProps {
    row: GridRow;
    selectedElementId: string | null;
}

export function GridProperties({ row, selectedElementId }: GridPropertiesProps) {
    const {
        changeBoxSize,
        modifyBoxCount,
        addGridSection,
        deleteGridSection,
        deleteRow,
    } = useWorksheetStore();

    // Find the selected section
    const selectedSection = selectedElementId
        ? row.sections.find((s) => s.id === selectedElementId)
        : row.sections[0];

    if (!selectedSection) {
        return <div className={styles.empty}>No section selected</div>;
    }

    const handleBoxSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        changeBoxSize(row.id, selectedSection.id, e.target.value as BoxSize);
    };

    return (
        <div className={styles.properties}>
            <h3>Grid Section Properties</h3>

            <div className={styles.group}>
                <label>Box Size:</label>
                <select value={selectedSection.boxSize} onChange={handleBoxSizeChange}>
                    <option value="SIZE_8MM">8mm</option>
                    <option value="SIZE_10MM">10mm</option>
                    <option value="SIZE_12MM">12mm</option>
                </select>
            </div>

            <div className={styles.group}>
                <label>Box Count: {selectedSection.boxes.length}</label>
                <div className={styles.buttonGroup}>
                    <button onClick={() => modifyBoxCount(row.id, selectedSection.id, -1)}>
                        - Remove
                    </button>
                    <button onClick={() => modifyBoxCount(row.id, selectedSection.id, 1)}>
                        + Add
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <label>Add Section:</label>
                <div className={styles.buttonGroup}>
                    <button onClick={() => addGridSection(row.id, 'left', selectedSection.id)}>
                        ← Left
                    </button>
                    <button onClick={() => addGridSection(row.id, 'right', selectedSection.id)}>
                        Right →
                    </button>
                </div>
            </div>

            <div className={styles.group}>
                <button
                    className={styles.deleteBtn}
                    onClick={() => {
                        if (row.sections.length > 1) {
                            deleteGridSection(row.id, selectedSection.id);
                        } else {
                            alert('Cannot delete the last section. Delete the entire row instead.');
                        }
                    }}
                >
                    Delete Section
                </button>
            </div>

            <div className={styles.group}>
                <button
                    className={styles.deleteBtn}
                    onClick={() => {
                        if (confirm('Delete entire grid row?')) {
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
