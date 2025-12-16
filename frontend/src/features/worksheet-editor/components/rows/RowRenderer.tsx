/**
 * RowRenderer - Polymorphic renderer for different row types
 */

import type { WorksheetRow } from '../../types/worksheet';
import { HeaderRow } from './HeaderRow';
import { TextRow } from './TextRow';
import { GridRow } from './GridRow/GridRow';
import { VocabularyRow } from './VocabularyRow/VocabularyRow';

interface RowRendererProps {
  row: WorksheetRow;
}

export function RowRenderer({ row }: RowRendererProps) {
  switch (row.type) {
    case 'HEADER':
      return <HeaderRow row={row} />;
    case 'TEXT':
      return <TextRow row={row} />;
    case 'GRID':
      return <GridRow row={row} />;
    case 'VOCABULARY':
      return <VocabularyRow row={row} />;
    default:
      return null;
  }
}
