package com.qtihelper.demo.model;

import com.qtihelper.demo.dto.worksheet.RowType;

/**
 * Sealed interface for row view models.
 * Each implementation represents a specific row type ready for template rendering.
 *
 * Using sealed interface (Java 17+) ensures exhaustive pattern matching
 * and guarantees only the specified implementations exist.
 */
public sealed interface RowViewModel
		permits HeaderRowViewModel, TextRowViewModel, GridRowViewModel {

	/**
	 * Returns the row type for template conditional rendering.
	 */
	RowType getType();

}
