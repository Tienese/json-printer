package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.LessonScope;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating word distribution statistics.
 * Used by Grammar Coach v3.0 for overuse/underuse detection.
 */
@Service
public class DistributionAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(DistributionAnalysisService.class);

    private final VocabRepository vocabRepository;

    public DistributionAnalysisService(VocabRepository vocabRepository) {
        this.vocabRepository = vocabRepository;
    }

    /**
     * Analyze word distribution in the worksheet.
     *
     * @param wordCounts  Map of base form -> count in worksheet
     * @param lessonScope The lesson scope for analysis
     * @return Distribution analysis result
     */
    public DistributionResult analyze(Map<String, Integer> wordCounts, LessonScope lessonScope) {
        if (wordCounts.isEmpty()) {
            return DistributionResult.empty();
        }

        // Get vocab pool for the lesson scope
        List<Vocab> vocabPool = getVocabPool(lessonScope);
        Set<String> poolBaseForms = vocabPool.stream()
                .map(Vocab::getBaseForm)
                .collect(Collectors.toSet());

        // Calculate statistics
        int totalWords = wordCounts.values().stream().mapToInt(Integer::intValue).sum();
        int uniqueWords = wordCounts.size();
        double mean = (double) totalWords / uniqueWords;
        double variance = wordCounts.values().stream()
                .mapToDouble(count -> Math.pow(count - mean, 2))
                .average()
                .orElse(0);
        double stdDev = Math.sqrt(variance);

        // Calculate thresholds
        int overuseThreshold = (int) Math.ceil(mean + 2 * stdDev);
        int underuseThreshold = Math.max(0, (int) Math.floor(mean - stdDev));

        // Detect overused and underused words
        List<WordFrequency> overused = new ArrayList<>();
        List<WordFrequency> underused = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : wordCounts.entrySet()) {
            String word = entry.getKey();
            int count = entry.getValue();

            if (count > overuseThreshold) {
                overused.add(new WordFrequency(word, count, overuseThreshold));
            }
        }

        // Find underused: words in pool that aren't used or used very little
        for (String poolWord : poolBaseForms) {
            int count = wordCounts.getOrDefault(poolWord, 0);
            if (count == 0) {
                underused.add(new WordFrequency(poolWord, 0, 1));
            }
        }

        // Sort by severity
        overused.sort((a, b) -> Integer.compare(b.count(), a.count()));
        underused.sort((a, b) -> Integer.compare(a.count(), b.count()));

        // Category breakdown
        Map<String, CategoryStats> categoryBreakdown = calculateCategoryBreakdown(wordCounts, vocabPool);

        log.info("Distribution analysis: {} total, {} unique, mean={}, stdDev={}, threshold={}",
                totalWords, uniqueWords, String.format("%.2f", mean), String.format("%.2f", stdDev), overuseThreshold);

        return new DistributionResult(
                totalWords,
                uniqueWords,
                vocabPool.size(),
                mean,
                stdDev,
                overuseThreshold,
                underuseThreshold,
                overused,
                underused.subList(0, Math.min(10, underused.size())),
                categoryBreakdown);
    }

    private List<Vocab> getVocabPool(LessonScope scope) {
        if (scope == null) {
            return vocabRepository.findAll();
        }
        return vocabRepository.findByLessonIdIn(scope.getLessonIds());
    }

    private Map<String, CategoryStats> calculateCategoryBreakdown(
            Map<String, Integer> wordCounts, List<Vocab> vocabPool) {

        Map<String, CategoryStats> breakdown = new HashMap<>();
        Map<String, List<Vocab>> byCategory = vocabPool.stream()
                .filter(v -> v.getCategory() != null)
                .collect(Collectors.groupingBy(Vocab::getCategory));

        for (Map.Entry<String, List<Vocab>> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            List<Vocab> categoryVocab = entry.getValue();

            int poolSize = categoryVocab.size();
            int used = 0;
            int totalOccurrences = 0;

            for (Vocab vocab : categoryVocab) {
                int count = wordCounts.getOrDefault(vocab.getBaseForm(), 0);
                if (count > 0) {
                    used++;
                    totalOccurrences += count;
                }
            }

            double coverage = poolSize > 0 ? (double) used / poolSize * 100 : 0;
            breakdown.put(category, new CategoryStats(poolSize, used, totalOccurrences, coverage));
        }

        return breakdown;
    }

    // Result records
    public record DistributionResult(
            int totalWords,
            int uniqueWords,
            int poolSize,
            double mean,
            double stdDev,
            int overuseThreshold,
            int underuseThreshold,
            List<WordFrequency> overused,
            List<WordFrequency> underused,
            Map<String, CategoryStats> categoryBreakdown) {
        public static DistributionResult empty() {
            return new DistributionResult(0, 0, 0, 0, 0, 3, 0,
                    List.of(), List.of(), Map.of());
        }
    }

    public record WordFrequency(String word, int count, int threshold) {
    }

    public record CategoryStats(int poolSize, int used, int totalOccurrences, double coverage) {
    }
}
