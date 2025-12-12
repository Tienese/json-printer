package com.qtihelper.demo.dto.worksheet;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Grid row for character practice boxes.
 * Contains box size, count, and optional pre-filled content.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GridRow extends WorksheetRow {

	private BoxSize boxSize = BoxSize.SIZE_10MM;

	private int boxCount = 10;

	private String content = ""; // Characters to pre-fill

	private boolean showGuideLines = true;

	public GridRow() {
	}

	public GridRow(BoxSize boxSize, int boxCount) {
		this.boxSize = boxSize;
		this.boxCount = boxCount;
	}

	public GridRow(BoxSize boxSize, int boxCount, String content) {
		this.boxSize = boxSize;
		this.boxCount = boxCount;
		this.content = content;
	}

	@Override
	public RowType getType() {
		return RowType.GRID;
	}

	@Override
	public void validate() {
		if (boxSize == null) {
			throw new IllegalArgumentException("Grid row must have a box size");
		}
		if (boxCount < 1) {
			throw new IllegalArgumentException("Grid row must have at least 1 box");
		}
		if (boxCount > boxSize.getMaxBoxesPerRow()) {
			throw new IllegalArgumentException(String.format(
					"Grid row box count %d exceeds maximum %d for %s boxes", boxCount,
					boxSize.getMaxBoxesPerRow(), boxSize.name()));
		}
	}

	// Getters and Setters

	public BoxSize getBoxSize() {
		return boxSize;
	}

	public void setBoxSize(BoxSize boxSize) {
		this.boxSize = boxSize;
	}

	public int getBoxCount() {
		return boxCount;
	}

	public void setBoxCount(int boxCount) {
		this.boxCount = boxCount;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public boolean isShowGuideLines() {
		return showGuideLines;
	}

	public void setShowGuideLines(boolean showGuideLines) {
		this.showGuideLines = showGuideLines;
	}

}
