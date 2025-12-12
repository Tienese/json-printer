package com.qtihelper.demo.model;

import com.qtihelper.demo.dto.worksheet.RowType;

/**
 * View model for header rows.
 * Immutable record for template rendering.
 */
public record HeaderRowViewModel(boolean showDate, boolean showName, String nameLabel,
		String dateLabel) implements RowViewModel {

	@Override
	public RowType getType() {
		return RowType.HEADER;
	}

}
