/**
 * GridRow component - Japanese character boxes with furigana
 * Supports multi-line layout and drag-drop section reordering
 */

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RowWrapper } from '../RowWrapper';
import { GridSection } from './GridSection';
import { useWorksheetStore } from '../../../stores/worksheetStore';
import { calculateLineLayout, SECTION_GAP_PX } from '../../../utils/gridLayoutCalculator';
import type { GridRow as GridRowType, GridSection as GridSectionType } from '../../../types/worksheet';
import styles from './GridRow.module.css';

interface GridRowProps {
  row: GridRowType;
}

interface DraggableSectionProps {
  rowId: string;
  section: GridSectionType;
}

function DraggableSection({ rowId, section }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.draggableSection}
      {...attributes}
      {...listeners}
    >
      <GridSection rowId={rowId} section={section} />
    </div>
  );
}

export function GridRow({ row }: GridRowProps) {
  const { reorderGridSections } = useWorksheetStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = row.sections.findIndex((s) => s.id === active.id);
      const newIndex = row.sections.findIndex((s) => s.id === over.id);
      reorderGridSections(row.id, oldIndex, newIndex);
    }
  };

  // Calculate line layout
  const lines = calculateLineLayout(row.sections);

  // Create a map of section id to section for quick lookup
  const sectionMap = new Map(row.sections.map((s) => [s.id, s]));

  return (
    <RowWrapper rowId={row.id}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={row.sections.map((s) => s.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className={styles.gridRow}>
            {lines.length === 0 ? (
              <div className={styles.empty}>
                No sections. Add a section from the properties panel.
              </div>
            ) : (
              lines.map((line, lineIndex) => (
                <div
                  key={`line-${lineIndex}`}
                  className={styles.gridLine}
                  style={{ gap: `${SECTION_GAP_PX}px` }}
                >
                  {line.sectionIds.map((sectionId) => {
                    const section = sectionMap.get(sectionId);
                    if (!section) return null;
                    return (
                      <DraggableSection
                        key={section.id}
                        rowId={row.id}
                        section={section}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </RowWrapper>
  );
}
