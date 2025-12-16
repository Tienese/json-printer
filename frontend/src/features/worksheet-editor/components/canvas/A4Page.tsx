/**
 * A4Page component - Single A4 sheet with rows
 * REQ-005: Fixed A4 size (210mm × 297mm)
 * REQ-006: Fixed margins (12.7mm = 0.5 inches)
 */

import { useWorksheetStore } from '../../stores/worksheetStore';
import { RowRenderer } from '../rows/RowRenderer';
import { A4_WIDTH_MM, A4_HEIGHT_MM, MARGIN_MM } from '../../utils/constants';
import type { Page } from '../../types/worksheet';
import styles from './A4Page.module.css';

interface A4PageProps {
  page: Page;
}

export function A4Page({ page }: A4PageProps) {
  const { rows } = useWorksheetStore();
  const pageRows = rows.filter((r) => page.rowIds.includes(r.id));

  return (
    <div
      className={styles.page}
      style={{
        width: `${A4_WIDTH_MM}mm`,
        height: `${A4_HEIGHT_MM}mm`,
      }}
    >
      <div
        className={styles.content}
        style={{ padding: `${MARGIN_MM}mm` }}
      >
        {pageRows.map((row) => (
          <RowRenderer key={row.id} row={row} />
        ))}
      </div>

      {page.pageNumber > 1 && (
        <div className={styles.pageNumber}>Page {page.pageNumber}</div>
      )}
    </div>
  );
}
