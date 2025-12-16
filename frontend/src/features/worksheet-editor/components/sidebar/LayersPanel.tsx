/**
 * LayersPanel - Photoshop-style layers panel with drag-and-drop
 * Shows all rows in order with ability to reorder, select, duplicate, delete
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWorksheetStore } from '../../stores/worksheetStore';
import { LayerItem } from './LayerItem';
import styles from './LayersPanel.module.css';

export function LayersPanel() {
  const { rows, reorderRows } = useWorksheetStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderRows(active.id as string, over.id as string);
    }
  };

  return (
    <div className={styles.layersPanel}>
      <div className={styles.header}>
        <span className={styles.title}>Layers</span>
        <span className={styles.count}>{rows.length} rows</span>
      </div>

      {rows.length === 0 ? (
        <div className={styles.emptyState}>
          No rows yet. Add rows using the toolbar buttons above.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className={styles.layersList}>
              {rows.map((row) => (
                <LayerItem key={row.id} row={row} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
