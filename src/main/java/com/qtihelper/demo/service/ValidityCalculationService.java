package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.LessonScope;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for calculating worksheet validity based on vocabulary coverage.
 * Used by Grammar Coach v3.0 to determine analysis reliability.
 */
@Service
public class ValidityCalculationService {

    private static final Logger log = LoggerFactory.getLogger(ValidityCalculationService.class);

    // Validity thresholds
    private static final double HIGH_OVERALL_THRESHOLD = 60.0;
    private static final double HIGH_MIN_CATEGORY_THRESHOLD = 30.0;
    private static final double HIGH_CATEGORIES_TOUCHED_THRESHOLD = 80.0;
    private static final double MEDIUM_OVERALL_THRESHOLD = 30.0;
    private static final double MEDIUM_CATEGORIES_TOUCHED_THRESHOLD = 60.0;

    private final VocabRepository vocabRepository;

    public ValidityCalculationService(VocabRepository vocabRepository) {
        this.vocabRepository = vocabRepository;
    }

    /**
     * Calculate validity for the worksheet analysis.
     *
     * @param wordCounts  Words used in the worksheet with counts
     * @param lessonScope The lesson scope for analysis
     * @return Validity result with level and note
     */
    public ValidityResult calculate(Map<String, Integer> wordCounts, LessonScope lessonScope) {
        if (wordCounts.isEmpty()) {
            return new ValidityResult("LOW", 0,
                    "Worksheet has no vocabulary content to analyze.");
        }

        // Get vocab pool
        var vocabPool = getVocabPool(lessonScope);
        if (vocabPool.isEmpty()) {
            return new ValidityResult("INVALID", 0,
                    "No vocabulary found for the specified lesson scope.");
        }

        // Calculate overall coverage
        var usedWords = wordCounts.keySet();
        var poolBaseForms = vocabPool.stream()
                .map(Vocab::getBaseForm)
                .collect(Collectors.toSet());

        long wordsInPool = usedWords.stream().filter(poolBaseForms::contains).count();
        double overallCoverage = (double) wordsInPool / poolBaseForms.size() * 100;

        // Calculate category coverage
        var byCategory = vocabPool.stream()
                .filter(v -> v.getCategory() != null)
                .collect(Collectors.groupingBy(Vocab::getCategory));

        int totalCategories = byCategory.size();
        int categoriesTouched = 0;
        double minCategoryCoverage = 100.0;

        for (Map.Entry<String, List<Vocab>> entry : byCategory.entrySet()) {
            Set<String> categoryWords = entry.getValue().stream()
                    .map(Vocab::getBaseForm)
                    .collect(Collectors.toSet());

            long used = usedWords.stream().filter(categoryWords::contains).count();
            double coverage = categoryWords.isEmpty() ? 0 : (double) used / categoryWords.size() * 100;

            if (coverage > 0) {
                categoriesTouched++;
            }
            minCategoryCoverage = Math.min(minCategoryCoverage, coverage);
        }

        double categoriesTouchedPercent = totalCategories > 0
                ? (double) categoriesTouched / totalCategories * 100
                : 0;

        // Determine validity level
        String level;
        String note;

        if (overallCoverage >= HIGH_OVERALL_THRESHOLD
                && minCategoryCoverage >= HIGH_MIN_CATEGORY_THRESHOLD
                && categoriesTouchedPercent >= HIGH_CATEGORIES_TOUCHED_THRESHOLD) {
            level = "HIGH";
            note = String.format("Excellent coverage (%.0f%%) across all categories. Statistics are highly reliable.",
                    overallCoverage);
        } else if (overallCoverage >= MEDIUM_OVERALL_THRESHOLD
                && categoriesTouchedPercent >= MEDIUM_CATEGORIES_TOUCHED_THRESHOLD) {
            level = "MEDIUM";
            // Find underrepresented categories
            List<String> underrep = byCategory.entrySet().stream()
                    .filter(e -> {
                        Set<String> categoryWords = e.getValue().stream()
                                .map(Vocab::getBaseForm).collect(Collectors.toSet());
                        long used = usedWords.stream().filter(categoryWords::contains).count();
                        return categoryWords.size() > 0 && (double) used / categoryWords.size() * 100 < 30;
                    })
                    .map(Map.Entry::getKey)
                    .limit(2)
                    .toList();

            if (underrep.isEmpty()) {
                note = String.format("Good category spread (%.0f%%). Statistics are mostly reliable.",
                        categoriesTouchedPercent);
            } else {
                note = String.format(
                        "Good category spread (%.0f%%). %s underrepresented. Consider adding more vocabulary from these categories.",
                        categoriesTouchedPercent, String.join(" and ", underrep));
            }
        } else {
            level = "LOW";
            // Find missing categories
            List<String> missing = byCategory.entrySet().stream()
                    .filter(e -> {
                        Set<String> categoryWords = e.getValue().stream()
                                .map(Vocab::getBaseForm).collect(Collectors.toSet());
                        return usedWords.stream().noneMatch(categoryWords::contains);
                    })
                    .map(Map.Entry::getKey)
                    .limit(3)
                    .toList();

            note = String.format("Worksheet covers %.0f%% of vocabulary.", overallCoverage);
            if (!missing.isEmpty()) {
                note += " Missing categories: " + String.join(", ", missing) + ".";
            }
            note += " Statistics are indicative only.";
        }

        log.info("Validity: {} (overall={}%, minCategory={}%, touched={}%)",
                level, String.format("%.1f", overallCoverage), String.format("%.1f", minCategoryCoverage),
                String.format("%.1f", categoriesTouchedPercent));

        return new ValidityResult(level, overallCoverage, note);
    }

    private List<Vocab> getVocabPool(LessonScope scope) {
        if (scope == null) {
            return vocabRepository.findAll();
        }
        return vocabRepository.findByLessonIdIn(scope.getLessonIds());
    }

    public record ValidityResult(String level, double overallCoverage, String note) {
    }
}
