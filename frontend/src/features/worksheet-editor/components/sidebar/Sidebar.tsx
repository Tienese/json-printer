/**
 * Sidebar component - REQ-008: Right-side panel with properties + layers
 */

import { useWorksheetStore } from '../../stores/worksheetStore';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './properties/PropertiesPanel';
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
          <PropertiesPanel />
        ) : (
          <LayersPanel />
        )}
      </div>
    </div>
  );
}
