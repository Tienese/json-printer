package com.qtihelper.demo.dto.worksheet;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Abstract base class for worksheet rows.
 * Uses Jackson polymorphism to deserialize concrete row types from JSON.
 *
 * JSON format examples:
 * { "type": "HEADER", "showDate": true, "showName": true }
 * { "type": "TEXT", "text": "Practice:", "fontSize": 14 }
 * { "type": "GRID", "boxSize": "SIZE_10MM", "boxCount": 10, "content": "あいう" }
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({ @JsonSubTypes.Type(value = HeaderRow.class, name = "HEADER"),
		@JsonSubTypes.Type(value = TextRow.class, name = "TEXT"),
		@JsonSubTypes.Type(value = GridRow.class, name = "GRID") })
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class WorksheetRow {

	/**
	 * Returns the row type for this row.
	 * Used by templates for conditional rendering.
	 */
	public abstract RowType getType();

	/**
	 * Validates this row's configuration.
	 * @throws IllegalArgumentException if validation fails
	 */
	public abstract void validate();

}
