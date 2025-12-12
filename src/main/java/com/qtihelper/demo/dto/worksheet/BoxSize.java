package com.qtihelper.demo.dto.worksheet;

/**
 * Enum representing available character box sizes for Japanese writing worksheets.
 * Each size has a specific millimeter measurement and maximum boxes per row
 * to fit within A4 printable area (184.6mm safe width).
 *
 * Box size calculations:
 * - SIZE_12MM: 15 boxes × 12mm = 180mm (4.6mm margin)
 * - SIZE_10MM: 18 boxes × 10mm = 180mm (4.6mm margin)
 * - SIZE_08MM: 23 boxes × 8mm = 184mm (0.6mm margin)
 */
public enum BoxSize {

	SIZE_12MM(12, 15), // 1.2cm boxes, max 15 per row
	SIZE_10MM(10, 18), // 1.0cm boxes, max 18 per row
	SIZE_08MM(8, 23); // 0.8cm boxes, max 23 per row

	private final int sizeInMm;

	private final int maxBoxesPerRow;

	BoxSize(int sizeInMm, int maxBoxesPerRow) {
		this.sizeInMm = sizeInMm;
		this.maxBoxesPerRow = maxBoxesPerRow;
	}

	public int getSizeInMm() {
		return sizeInMm;
	}

	public int getMaxBoxesPerRow() {
		return maxBoxesPerRow;
	}

	/**
	 * Returns CSS class name for this box size.
	 * Used in templates for styling.
	 */
	public String getCssClass() {
		return "size-" + sizeInMm + "mm";
	}

}
