package com.qtihelper.demo.dto.worksheet;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Text row for displaying instructions or prompts.
 * Renders as styled text with configurable font size.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TextRow extends WorksheetRow {

	private String text = "";

	private int fontSize = 14; // pt

	private boolean bold = false;

	private String alignment = "left"; // left, center, right

	public TextRow() {
	}

	public TextRow(String text) {
		this.text = text;
	}

	public TextRow(String text, int fontSize) {
		this.text = text;
		this.fontSize = fontSize;
	}

	@Override
	public RowType getType() {
		return RowType.TEXT;
	}

	@Override
	public void validate() {
		if (text == null || text.isBlank()) {
			throw new IllegalArgumentException("Text row must have non-empty text");
		}
		if (fontSize < 8 || fontSize > 72) {
			throw new IllegalArgumentException(
					"Font size must be between 8pt and 72pt");
		}
		if (!List.of("left", "center", "right").contains(alignment)) {
			throw new IllegalArgumentException(
					"Alignment must be left, center, or right");
		}
	}

	// Getters and Setters

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public int getFontSize() {
		return fontSize;
	}

	public void setFontSize(int fontSize) {
		this.fontSize = fontSize;
	}

	public boolean isBold() {
		return bold;
	}

	public void setBold(boolean bold) {
		this.bold = bold;
	}

	public String getAlignment() {
		return alignment;
	}

	public void setAlignment(String alignment) {
		this.alignment = alignment;
	}

}
