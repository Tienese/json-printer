package com.qtihelper.demo.dto.worksheet;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO for worksheet configuration.
 * Uses a list of polymorphic rows for flexible worksheet composition.
 *
 * JSON format:
 * {
 *   "title": "Practice Sheet 1",
 *   "showGuideLines": true,
 *   "rows": [
 *     { "type": "HEADER", "showDate": true, "showName": true },
 *     { "type": "TEXT", "text": "Practice hiragana:", "fontSize": 14 },
 *     { "type": "GRID", "boxSize": "SIZE_10MM", "boxCount": 10, "content": "あいう" },
 *     { "type": "GRID", "boxSize": "SIZE_10MM", "boxCount": 10, "content": "" }
 *   ]
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorksheetConfigDto {

	private String title = "Japanese Writing Practice";

	private boolean showGuideLines = true; // Global setting for all grid rows

	private List<WorksheetRow> rows = new ArrayList<>();

	// Constructors

	public WorksheetConfigDto() {
	}

	// Getters and Setters

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public boolean isShowGuideLines() {
		return showGuideLines;
	}

	public void setShowGuideLines(boolean showGuideLines) {
		this.showGuideLines = showGuideLines;
	}

	public List<WorksheetRow> getRows() {
		return rows;
	}

	public void setRows(List<WorksheetRow> rows) {
		this.rows = rows;
	}

	/**
	 * Adds a row to the configuration.
	 */
	public void addRow(WorksheetRow row) {
		this.rows.add(row);
	}

}
