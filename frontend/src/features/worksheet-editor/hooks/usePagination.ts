import { useEffect, useRef } from 'react';
import { useWorksheetStore } from '../stores/worksheetStore';

/**
 * Hook to measure row heights using ResizeObserver and trigger pagination recalculation
 * @param rowId - The ID of the row to observe
 * @param enabled - Whether to enable observation (default: true)
 */
export function usePagination(rowId: string, enabled = true) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { setRowHeight, recalculatePagination } = useWorksheetStore();

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    // Create ResizeObserver to watch for height changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;

        // Update the row height in the store
        setRowHeight(rowId, height);

        // Trigger pagination recalculation
        // Use a small delay to batch updates
        setTimeout(() => {
          recalculatePagination();
        }, 10);
      }
    });

    // Start observing
    resizeObserver.observe(element);

    // Initial measurement
    const initialHeight = element.getBoundingClientRect().height;
    setRowHeight(rowId, initialHeight);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [rowId, enabled, setRowHeight, recalculatePagination]);

  return elementRef;
}
