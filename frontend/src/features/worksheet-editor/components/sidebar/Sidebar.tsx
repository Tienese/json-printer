/**
 * Sidebar component - REQ-008: Right-side panel with properties + layers
 */

import { useWorksheetStore } from '../../stores/worksheetStore';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { activeSidebarTab, setActiveSidebarTab } = useWorksheetStore();

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeSidebarTab === 'properties' ? styles.active : ''}`}
          onClick={() => setActiveSidebarTab('properties')}
        >
          Properties
        </button>
        <button
          className={`${styles.tab} ${activeSidebarTab === 'layers' ? styles.active : ''}`}
          onClick={() => setActiveSidebarTab('layers')}
        >
          Layers
        </button>
      </div>

      <div className={styles.content}>
        {activeSidebarTab === 'properties' ? (
          <div className={styles.panel}>
            <p className={styles.placeholder}>
              Select an element to edit properties
            </p>
            <p className={styles.note}>
              Properties panel will be implemented in Phase 6
            </p>
          </div>
        ) : (
          <div className={styles.panel}>
            <p className={styles.placeholder}>Layers panel</p>
            <p className={styles.note}>
              Drag-and-drop layers will be implemented in Phase 5
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
