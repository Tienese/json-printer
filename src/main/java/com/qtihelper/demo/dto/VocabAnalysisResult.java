package com.qtihelper.demo.dto;

import java.util.List;

/**
 * Result of vocabulary gap analysis.
 * Contains coverage statistics and list of missing words.
 */
public record VocabAnalysisResult(
        int coveragePercent,           // 0-100
        int totalVocabCount,           // Total words in target lesson(s)
        int usedCount,                 // Words found in worksheet
        List<MissingWord> missingWords // Words not found in worksheet
) {
    /**
     * A vocabulary word that was not found in the worksheet.
     */
    public record MissingWord(
            String displayForm,        // Original form from CSV
            String baseForm            // Normalized dictionary form
    ) {}
}
