package com.qtihelper.demo.model;

import java.util.List;

/**
 * Immutable view model for worksheet template rendering.
 * Contains title, global settings, and list of typed row view models.
 */
public record WorksheetViewModel(String title, boolean showGuideLines,
		List<RowViewModel> rows, int totalGridRows, // Count of GRID type rows
		int totalCharacterBoxes // Sum of all boxes across all grid rows
) {

	/**
	 * Compact canonical constructor for validation.
	 */
	public WorksheetViewModel {
		if (rows == null || rows.isEmpty()) {
			throw new IllegalArgumentException("Worksheet must have at least one row");
		}
	}

}
