/**
 * Canvas Viewport - Scrollable container for A4 pages
 * REQ-002: WYSIWYG interaction with pixel-perfect canvas
 */

import { useWorksheetStore } from '../../stores/worksheetStore';
import { A4Page } from './A4Page';
import styles from './CanvasViewport.module.css';

export function CanvasViewport() {
  const { pages, zoom } = useWorksheetStore();

  return (
    <div className={styles.viewport}>
      <div className={styles.canvas} style={{ transform: `scale(${zoom})` }}>
        {pages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No rows added yet.</p>
            <p>Click the buttons above to add content to your worksheet.</p>
          </div>
        ) : (
          pages.map((page) => <A4Page key={page.pageNumber} page={page} />)
        )}
      </div>
    </div>
  );
}
