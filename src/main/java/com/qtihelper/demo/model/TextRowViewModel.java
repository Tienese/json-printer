package com.qtihelper.demo.model;

import com.qtihelper.demo.dto.worksheet.RowType;

/**
 * View model for text rows.
 * Immutable record for template rendering.
 */
public record TextRowViewModel(String text, int fontSize, boolean bold, String alignment)
		implements RowViewModel {

	@Override
	public RowType getType() {
		return RowType.TEXT;
	}

	/**
	 * Returns CSS style string for this text row.
	 */
	public String getCssStyle() {
		StringBuilder style = new StringBuilder();
		style.append("font-size: ").append(fontSize).append("pt;");
		if (bold) {
			style.append(" font-weight: bold;");
		}
		style.append(" text-align: ").append(alignment).append(";");
		return style.toString();
	}

}
