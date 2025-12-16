/**
 * HeaderProperties - Properties panel for Header rows
 */

import type { HeaderRow } from '../../../types/worksheet';
import styles from './Properties.module.css';

interface HeaderPropertiesProps {
    row: HeaderRow;
}

export function HeaderProperties({ }: HeaderPropertiesProps) {
    return (
        <div className={styles.properties}>
            <h3>Header Properties</h3>
            <p className={styles.note}>
                Header properties will be implemented in a future update.
            </p>
        </div>
    );
}
