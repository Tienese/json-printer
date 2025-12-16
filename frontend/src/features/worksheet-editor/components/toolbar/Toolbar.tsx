/**
 * Toolbar component with zoom, guides, print, and add row controls
 */

import { useWorksheetStore } from '../../stores/worksheetStore';
import { ZoomControls } from './ZoomControls';
import { PrintButton } from './PrintButton';
import type { RowType } from '../../types/worksheet';
import styles from './Toolbar.module.css';

export function Toolbar() {
  const { title, setTitle, showGuideLines, toggleGuideLines, addRow, recalculatePagination } =
    useWorksheetStore();

  const handleAddRow = (type: RowType) => {
    addRow(type);
    // Trigger pagination recalculation so new row appears immediately
    recalculatePagination();
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>Worksheet Editor</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.titleInput}
          placeholder="Worksheet title..."
        />
      </div>

      <div className={styles.center}>
        <div className={styles.addButtons}>
          <button
            onClick={() => handleAddRow('HEADER')}
            className={styles.addBtn}
            title="Add Header Row"
          >
            + Header
          </button>
          <button
            onClick={() => handleAddRow('TEXT')}
            className={styles.addBtn}
            title="Add Text Row"
          >
            + Text
          </button>
          <button
            onClick={() => handleAddRow('GRID')}
            className={styles.addBtn}
            title="Add Grid Row"
          >
            + Grid
          </button>
          <button
            onClick={() => handleAddRow('VOCABULARY')}
            className={styles.addBtn}
            title="Add Vocabulary Row"
          >
            + Vocabulary
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <button
          onClick={toggleGuideLines}
          className={`${styles.guideBtn} ${showGuideLines ? styles.active : ''}`}
          title="Toggle guide lines"
        >
          {showGuideLines ? '✓' : '✗'} Guides
        </button>
        <ZoomControls />
        <PrintButton />
      </div>
    </div>
  );
}
