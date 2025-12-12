package com.qtihelper.demo.model;

import java.util.List;

import com.qtihelper.demo.dto.worksheet.RowType;

/**
 * View model for grid rows.
 * Contains pre-processed character list for box rendering.
 */
public record GridRowViewModel(int boxSizeMm, int boxCount, List<String> characters, // Pre-split
																						// and
																						// padded
																						// character
																						// list
		boolean showGuideLines, String cssClass // e.g., "box-10mm"
) implements RowViewModel {

	@Override
	public RowType getType() {
		return RowType.GRID;
	}

	/**
	 * Returns CSS style for grid template columns.
	 */
	public String getGridStyle() {
		return String.format("--box-size: %dmm; --box-count: %d;", boxSizeMm, boxCount);
	}

}
