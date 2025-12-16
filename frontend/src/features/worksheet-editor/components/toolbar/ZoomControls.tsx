import { useWorksheetStore } from '../../stores/worksheetStore';
import { ZOOM_LEVELS } from '../../utils/constants';
import styles from './ZoomControls.module.css';

export function ZoomControls() {
  const { zoom, setZoom } = useWorksheetStore();

  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z === zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z === zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  return (
    <div className={styles.controls}>
      <button
        onClick={zoomOut}
        disabled={zoom === ZOOM_LEVELS[0]}
        className={styles.btn}
        title="Zoom out"
      >
        −
      </button>
      <span className={styles.label}>{Math.round(zoom * 100)}%</span>
      <button
        onClick={zoomIn}
        disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
        className={styles.btn}
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
}
