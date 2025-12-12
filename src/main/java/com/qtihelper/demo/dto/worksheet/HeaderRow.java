package com.qtihelper.demo.dto.worksheet;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Header row for displaying student name and/or date fields.
 * Renders as a bordered row with optional name line and date placeholder.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class HeaderRow extends WorksheetRow {

	private boolean showDate = true;

	private boolean showName = true;

	private String nameLabel = "Name:";

	private String dateLabel = "Date:";

	public HeaderRow() {
	}

	public HeaderRow(boolean showDate, boolean showName) {
		this.showDate = showDate;
		this.showName = showName;
	}

	@Override
	public RowType getType() {
		return RowType.HEADER;
	}

	@Override
	public void validate() {
		// At least one field should be shown
		if (!showDate && !showName) {
			throw new IllegalArgumentException(
					"Header row must show at least name or date");
		}
	}

	// Getters and Setters

	public boolean isShowDate() {
		return showDate;
	}

	public void setShowDate(boolean showDate) {
		this.showDate = showDate;
	}

	public boolean isShowName() {
		return showName;
	}

	public void setShowName(boolean showName) {
		this.showName = showName;
	}

	public String getNameLabel() {
		return nameLabel;
	}

	public void setNameLabel(String nameLabel) {
		this.nameLabel = nameLabel;
	}

	public String getDateLabel() {
		return dateLabel;
	}

	public void setDateLabel(String dateLabel) {
		this.dateLabel = dateLabel;
	}

}
