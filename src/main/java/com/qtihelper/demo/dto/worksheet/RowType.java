package com.qtihelper.demo.dto.worksheet;

/**
 * Enum representing the types of rows available in a worksheet.
 * Used as discriminator for Jackson polymorphism and template conditional rendering.
 */
public enum RowType {

	/** Header row with name and/or date fields */
	HEADER,

	/** Text row for instructions or prompts */
	TEXT,

	/** Grid row for character practice boxes */
	GRID

}
