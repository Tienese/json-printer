/**
 * PropertiesPanel - Context-aware properties editor
 * Shows different controls based on selected row type
 */

import { useWorksheetStore } from '../../../stores/worksheetStore';
import { GridProperties } from './GridProperties';
import { VocabProperties } from './VocabProperties';
import { TextProperties } from './TextProperties';
import { HeaderProperties } from './HeaderProperties';
import styles from './PropertiesPanel.module.css';

export function PropertiesPanel() {
    const { rows, selectedRowId, selectedElementId } = useWorksheetStore();

    if (!selectedRowId) {
        return (
            <div className={styles.empty}>
                <p>Select an element to edit its properties</p>
            </div>
        );
    }

    const selectedRow = rows.find((r) => r.id === selectedRowId);
    if (!selectedRow) {
        return <div className={styles.empty}>Row not found</div>;
    }

    return (
        <div className={styles.panel}>
            {selectedRow.type === 'GRID' && (
                <GridProperties row={selectedRow} selectedElementId={selectedElementId} />
            )}
            {selectedRow.type === 'VOCABULARY' && <VocabProperties row={selectedRow} />}
            {selectedRow.type === 'TEXT' && <TextProperties row={selectedRow} />}
            {selectedRow.type === 'HEADER' && <HeaderProperties row={selectedRow} />}
        </div>
    );
}
