package com.qtihelper.demo.dto;

/**
 * Represents a segment of text extracted from a worksheet item.
 * Used for location tracking in grammar analysis.
 */
public record ExtractedSegment(
        String text, // The extracted text content
        int itemIndex, // Index of the item in the worksheet (0-based)
        String itemType, // Type of item (VOCAB, GRID, CLOZE, etc.)
        String itemId // Unique ID of the item
) {
}
