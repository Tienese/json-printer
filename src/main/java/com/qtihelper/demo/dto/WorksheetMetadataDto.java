package com.qtihelper.demo.dto;

/**
 * Metadata summary for worksheet content analysis.
 * Used for dashboard preview cards to show item counts.
 */
public record WorksheetMetadataDto(
        int gridCount,
        int vocabCount,
        int textCount,
        int mcCount,
        int tfCount,
        int matchingCount,
        int clozeCount) {
}
