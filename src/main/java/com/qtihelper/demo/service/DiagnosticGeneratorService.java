package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.GrammarCoachResult.Diagnostic;
import com.qtihelper.demo.dto.GrammarCoachResult.Suggestion;
import com.qtihelper.demo.dto.GrammarCoachResult.WordLocation;
import com.qtihelper.demo.dto.LessonScope;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating diagnostics from analysis results.
 * Creates ERROR/WARNING/INFO/HINT messages with suggestions.
 */
@Service
public class DiagnosticGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(DiagnosticGeneratorService.class);

    private final VocabRepository vocabRepository;

    public DiagnosticGeneratorService(VocabRepository vocabRepository) {
        this.vocabRepository = vocabRepository;
    }

    /**
     * Generate diagnostics for overused words.
     */
    public List<Diagnostic> generateOveruseDiagnostics(
            List<DistributionAnalysisService.WordFrequency> overused,
            Map<String, Integer> wordCounts,
            Map<String, List<WordLocation>> wordLocations,
            LessonScope lessonScope,
            double stdDev) {

        List<Diagnostic> diagnostics = new ArrayList<>();

        for (DistributionAnalysisService.WordFrequency freq : overused) {
            String word = freq.word();
            int count = freq.count();
            int threshold = freq.threshold();

            // Calculate severity based on standard deviations above threshold
            String severity;
            double deviationsOver = stdDev > 0 ? (count - threshold) / stdDev : 0;
            if (deviationsOver >= 3) {
                severity = "ERROR";
            } else if (deviationsOver >= 2) {
                severity = "WARNING";
            } else {
                severity = "INFO";
            }

            // Generate message
            String message = String.format("'%s' appears %d times (threshold: %d)", word, count, threshold);

            // Get locations
            List<WordLocation> locations = wordLocations.getOrDefault(word, List.of());

            // Generate suggestions
            List<Suggestion> primarySuggestions = generateSuggestions(word, wordCounts, lessonScope, true);
            List<Suggestion> secondarySuggestions = generateSuggestions(word, wordCounts, lessonScope, false);

            diagnostics.add(new Diagnostic(
                    severity,
                    "OVERUSE",
                    message,
                    word,
                    count,
                    threshold,
                    locations.subList(0, Math.min(5, locations.size())),
                    primarySuggestions.subList(0, Math.min(5, primarySuggestions.size())),
                    secondarySuggestions.subList(0, Math.min(3, secondarySuggestions.size()))));
        }

        return diagnostics;
    }

    /**
     * Generate diagnostics for category imbalance.
     */
    public List<Diagnostic> generateCategoryDiagnostics(
            Map<String, DistributionAnalysisService.CategoryStats> categoryBreakdown) {

        List<Diagnostic> diagnostics = new ArrayList<>();

        // Find categories with very low coverage compared to others
        double avgCoverage = categoryBreakdown.values().stream()
                .mapToDouble(DistributionAnalysisService.CategoryStats::coverage)
                .average()
                .orElse(0);

        for (Map.Entry<String, DistributionAnalysisService.CategoryStats> entry : categoryBreakdown.entrySet()) {
            String category = entry.getKey();
            DistributionAnalysisService.CategoryStats stats = entry.getValue();

            // Flag if coverage is less than 30% and other categories are above 60%
            if (stats.coverage() < 30 && avgCoverage > 50) {
                String message = String.format("Category '%s' is underrepresented (%.0f%% coverage vs %.0f%% average)",
                        category, stats.coverage(), avgCoverage);

                diagnostics.add(new Diagnostic(
                        "INFO",
                        "CATEGORY_IMBALANCE",
                        message,
                        category,
                        stats.used(),
                        stats.poolSize() / 3, // Expected at least 1/3 coverage
                        List.of(),
                        List.of(),
                        List.of()));
            }
        }

        return diagnostics;
    }

    /**
     * Generate suggestions for replacing an overused word.
     * Primary suggestions: same POS
     * Secondary suggestions: different POS (requires restructure)
     */
    private List<Suggestion> generateSuggestions(
            String overusedWord,
            Map<String, Integer> wordCounts,
            LessonScope lessonScope,
            boolean samePosOnly) {

        List<Suggestion> suggestions = new ArrayList<>();

        // Get the overused word's info
        List<Vocab> overusedVocabs = vocabRepository.findAll().stream()
                .filter(v -> v.getBaseForm().equals(overusedWord))
                .toList();

        if (overusedVocabs.isEmpty()) {
            return suggestions;
        }

        String targetCategory = overusedVocabs.get(0).getCategory();
        String targetPos = overusedVocabs.get(0).getPartOfSpeech();

        // Get vocab pool
        List<Vocab> pool = lessonScope != null
                ? vocabRepository.findByLessonIdIn(lessonScope.getLessonIds())
                : vocabRepository.findAll();

        // Find alternatives
        for (Vocab vocab : pool) {
            if (vocab.getBaseForm().equals(overusedWord)) {
                continue;
            }

            int currentUsage = wordCounts.getOrDefault(vocab.getBaseForm(), 0);

            // Skip if already overused
            if (currentUsage > 3) {
                continue;
            }

            boolean posMatch = targetPos != null && targetPos.equals(vocab.getPartOfSpeech());
            boolean categoryMatch = targetCategory != null && targetCategory.equals(vocab.getCategory());

            if (samePosOnly) {
                if (posMatch || categoryMatch) {
                    suggestions.add(new Suggestion(
                            vocab.getBaseForm(),
                            currentUsage,
                            currentUsage == 0 ? "Not used yet" : String.format("%d uses", currentUsage)));
                }
            } else {
                if (!posMatch && categoryMatch) {
                    suggestions.add(new Suggestion(
                            vocab.getBaseForm(),
                            currentUsage,
                            "Requires sentence restructure"));
                }
            }
        }

        // Sort by usage (prefer unused words)
        suggestions.sort(Comparator.comparingInt(Suggestion::currentUsage));

        return suggestions;
    }

    /**
     * Calculate score based on diagnostics.
     */
    public int calculateScore(List<Diagnostic> diagnostics, String validity) {
        int score = 100;

        // Deduct for errors
        long errors = diagnostics.stream().filter(d -> "ERROR".equals(d.severity())).count();
        score -= errors * 15;

        // Deduct for warnings
        long warnings = diagnostics.stream().filter(d -> "WARNING".equals(d.severity())).count();
        score -= warnings * 5;

        // Deduct for category imbalance
        long imbalances = diagnostics.stream().filter(d -> "CATEGORY_IMBALANCE".equals(d.type())).count();
        score -= imbalances * 10;

        // Validity penalty
        if ("LOW".equals(validity)) {
            score -= 10;
        } else if ("MEDIUM".equals(validity)) {
            score -= 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get score interpretation.
     */
    public String getScoreInterpretation(int score) {
        if (score >= 80) {
            return "Excellent";
        } else if (score >= 60) {
            return "Good";
        } else if (score >= 40) {
            return "Needs Work";
        } else {
            return "Review Required";
        }
    }
}
