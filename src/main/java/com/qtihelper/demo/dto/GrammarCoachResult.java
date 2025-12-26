package com.qtihelper.demo.dto;

import java.util.List;
import java.util.Map;

/**
 * Grammar Coach v3.0 analysis result.
 * Complete response structure matching TypeScript interface.
 */
public record GrammarCoachResult(
        Meta meta,
        Distribution distribution,
        List<Diagnostic> diagnostics,
        SlotAnalysis slotAnalysis,
        Score score) {
    // Meta information
    public record Meta(
            String validity, // HIGH, MEDIUM, LOW, INVALID
            String validityNote,
            LessonScope lessonScope,
            int poolSize,
            int wordsAnalyzed) {
    }

    // Distribution statistics
    public record Distribution(
            int totalWords,
            int uniqueWords,
            double mean,
            double stdDev,
            int overuseThreshold,
            Map<String, CategoryBreakdown> categoryBreakdown) {
    }

    public record CategoryBreakdown(
            int poolSize,
            int used,
            double coverage) {
    }

    // Diagnostic (warning/error/info)
    public record Diagnostic(
            String severity, // ERROR, WARNING, INFO, HINT
            String type, // OVERUSE, UNDERUSE, CATEGORY_IMBALANCE, OUT_OF_SCOPE
            String message,
            String targetWord,
            int actualCount,
            int threshold,
            List<WordLocation> locations,
            List<Suggestion> primarySuggestions,
            List<Suggestion> secondarySuggestions) {
    }

    public record WordLocation(
            int itemIndex,
            String itemType,
            String preview) {
    }

    public record Suggestion(
            String word,
            int currentUsage,
            String note) {
    }

    // Slot analysis
    public record SlotAnalysis(
            Map<String, Integer> slotsUsed,
            List<String> slotsMissing,
            String summary) {
    }

    // Score
    public record Score(
            int value, // 0-100
            String interpretation // Excellent, Good, Needs Work, Review Required
    ) {
    }

    /**
     * Create an empty/error result.
     */
    public static GrammarCoachResult empty(String errorMessage) {
        return new GrammarCoachResult(
                new Meta("INVALID", errorMessage, null, 0, 0),
                new Distribution(0, 0, 0, 0, 3, Map.of()),
                List.of(),
                new SlotAnalysis(Map.of(), List.of(), "No analysis available."),
                new Score(0, "No content to analyze"));
    }
}
