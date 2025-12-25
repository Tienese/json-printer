package com.qtihelper.demo.dto;

import java.util.List;

/**
 * Result of grammar analysis on a worksheet.
 * Contains usage statistics, rule violations, and suggestions.
 */
public record GrammarAnalysisResult(
        // Vocabulary coverage stats
        int totalWordsScanned,
        int uniqueWordsFound,

        // POS distribution
        List<PosCount> posCounts,

        // Rule violations found
        List<RuleViolation> violations,

        // Aggregated score (0-100)
        int score) {
    /**
     * Count of words by Part of Speech.
     */
    public record PosCount(String pos, int count) {
    }

    /**
     * A grammar rule that was violated.
     */
    public record RuleViolation(
            Long ruleId,
            String ruleName,
            String ruleType,
            String targetWord,
            int actualCount,
            int threshold,
            String message,
            List<String> suggestions) {
    }
}
