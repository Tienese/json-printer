/**
 * Constants for Worksheet Editor
 * All measurements follow A4 paper standard with 0.5" margins
 */

// A4 Dimensions
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MARGIN_MM = 12.7; // 0.5 inches = 12.7mm

// Usable area (minus margins)
export const USABLE_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2; // 184.6mm
export const USABLE_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2; // 271.6mm

// Conversion factor: 96 DPI standard
export const MM_TO_PX = 3.7795275591;

// Pixel dimensions
export const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX; // ~793.7px
export const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX; // ~1122.5px
export const USABLE_HEIGHT_PX = USABLE_HEIGHT_MM * MM_TO_PX; // ~1026.4px
export const MARGIN_PX = MARGIN_MM * MM_TO_PX; // ~48px

// Grid box sizes
export const BOX_SIZES = {
  SIZE_8MM: { mm: 8, maxPerRow: 23, px: 8 * MM_TO_PX },
  SIZE_10MM: { mm: 10, maxPerRow: 18, px: 10 * MM_TO_PX },
  SIZE_12MM: { mm: 12, maxPerRow: 15, px: 12 * MM_TO_PX },
} as const;

// Font family (Vietnamese + Japanese support)
export const FONT_FAMILY = "'Noto Sans', 'Noto Sans JP', sans-serif";

// Zoom levels
export const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
export const DEFAULT_ZOOM = 1.0;

// Pagination settings
export const PAGINATION_DEBOUNCE_MS = 100;

// Default row settings
export const DEFAULT_TEXT_FONT_SIZE = 12;
export const MIN_TEXT_FONT_SIZE = 8;
export const MAX_TEXT_FONT_SIZE = 24;

export const DEFAULT_GRID_BOX_COUNT = 10;
export const DEFAULT_BOX_SIZE = 'SIZE_10MM';

export const DEFAULT_VOCAB_COLUMNS = 2;
export const DEFAULT_VOCAB_LINE_STYLE = 'dashed';
