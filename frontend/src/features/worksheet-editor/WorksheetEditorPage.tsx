/**
 * Main Worksheet Editor Page (WYSIWYG)
 * REQ-001: Renamed from "Builder" to "Editor"
 */

import { useEffect } from 'react';
import { useWorksheetStore } from './stores/worksheetStore';
import { Toolbar } from './components/toolbar/Toolbar';
import { CanvasViewport } from './components/canvas/CanvasViewport';
import { Sidebar } from './components/sidebar/Sidebar';
import styles from './WorksheetEditorPage.module.css';

export function WorksheetEditorPage() {
  const { recalculatePagination } = useWorksheetStore();

  useEffect(() => {
    // Initial pagination calculation
    recalculatePagination();
  }, []);

  return (
    <div className={styles.editorLayout}>
      <Toolbar />
      <div className={styles.mainContent}>
        <CanvasViewport />
        <Sidebar />
      </div>
    </div>
  );
}
