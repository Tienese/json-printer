package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.GrammarAnalysisResult;
import com.qtihelper.demo.dto.GrammarAnalysisResult.PosCount;
import com.qtihelper.demo.dto.GrammarAnalysisResult.RuleViolation;
import com.qtihelper.demo.entity.GrammarRule;
import com.qtihelper.demo.entity.RuleSuggestion;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core analysis engine for the Language Coach.
 * Scans worksheet content, tokenizes Japanese text, and evaluates grammar
 * rules.
 * Only counts words that exist in the vocab database (from lesson CSVs).
 * Uses statistical threshold (mean + 1.5*stddev) for overuse detection.
 */
@Service
public class GrammarAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GrammarAnalysisService.class);

    private final WorksheetScannerService scannerService;
    private final SudachiTokenizerService tokenizerService;
    private final GrammarRuleService ruleService;
    private final VocabRepository vocabRepository;

    public GrammarAnalysisService(
            WorksheetScannerService scannerService,
            SudachiTokenizerService tokenizerService,
            GrammarRuleService ruleService,
            VocabRepository vocabRepository) {
        this.scannerService = scannerService;
        this.tokenizerService = tokenizerService;
        this.ruleService = ruleService;
        this.vocabRepository = vocabRepository;
    }

    /**
     * Analyze worksheet JSON for grammar issues.
     * Only counts words that exist in the vocab database.
     *
     * @param worksheetJson Full worksheet JSON string
     * @return Analysis result with violations and suggestions
     */
    public GrammarAnalysisResult analyze(String worksheetJson) {
        log.info("Starting grammar analysis on worksheet");

        // Step 1: Load vocab base forms from database for filtering
        Set<String> vocabBaseForms = vocabRepository.findAll().stream()
                .map(Vocab::getBaseForm)
                .collect(Collectors.toSet());
        log.debug("Loaded {} vocab words from database for filtering", vocabBaseForms.size());

        // Step 2: Extract all text from worksheet (all pages, all items)
        List<String> textBlocks = scannerService.extractAllText(worksheetJson);
        log.debug("Extracted {} text blocks from worksheet", textBlocks.size());

        // Step 3: Tokenize and count ONLY words that exist in vocab database
        Map<String, Integer> wordCounts = new HashMap<>();
        Map<String, Integer> posCounts = new HashMap<>();
        int totalVocabWords = 0;
        int totalTokens = 0;

        for (String text : textBlocks) {
            List<SudachiTokenizerService.TokenResult> tokens = tokenizerService.tokenizeWithPos(text);
            for (SudachiTokenizerService.TokenResult token : tokens) {
                totalTokens++;

                // ONLY count words that exist in vocab database
                if (vocabBaseForms.contains(token.baseForm())) {
                    wordCounts.merge(token.baseForm(), 1, Integer::sum);
                    totalVocabWords++;

                    // Count POS for vocab words only
                    String posCategory = simplifyPos(token.pos());
                    if (posCategory != null) {
                        posCounts.merge(posCategory, 1, Integer::sum);
                    }
                }
            }
        }

        log.info("Found {} vocab words (from {} total tokens), {} unique",
                totalVocabWords, totalTokens, wordCounts.size());

        // Step 4: Calculate statistical threshold for overuse
        List<RuleViolation> violations = detectOveruseStatistically(wordCounts);

        // Step 5: Also check explicit rules from database
        List<GrammarRule> enabledRules = ruleService.getEnabledRules();
        for (GrammarRule rule : enabledRules) {
            RuleViolation violation = evaluateRule(rule, wordCounts);
            if (violation != null && violations.stream().noneMatch(v -> v.targetWord().equals(rule.getTargetWord()))) {
                violations.add(violation);
            }
        }

        log.info("Found {} total violations", violations.size());

        // Step 6: Calculate score
        int score = calculateScore(violations, totalVocabWords);

        // Step 7: Build POS count list
        List<PosCount> posCountList = posCounts.entrySet().stream()
                .map(e -> new PosCount(e.getKey(), e.getValue()))
                .sorted((a, b) -> Integer.compare(b.count(), a.count()))
                .toList();

        return new GrammarAnalysisResult(
                totalVocabWords,
                wordCounts.size(),
                posCountList,
                violations,
                score);
    }

    /**
     * Detect overused words using FIXED threshold.
     * IMPORTANT: Threshold does NOT move with the data!
     * 
     * Algorithm v2.0:
     * - threshold = MAX(3, 15% of unique vocab words)
     * - Any word appearing more than threshold is flagged
     */
    private List<RuleViolation> detectOveruseStatistically(Map<String, Integer> wordCounts) {
        List<RuleViolation> violations = new ArrayList<>();

        if (wordCounts.isEmpty()) {
            return violations;
        }

        // FIXED threshold calculation (v2.0)
        // - Absolute minimum: 3 (no word should appear > 3 times in small worksheets)
        // - Scales with size: 15% of unique words for larger worksheets
        int uniqueWords = wordCounts.size();
        int percentageThreshold = (int) Math.ceil(uniqueWords * 0.15);
        int absoluteMinimum = 3;
        int threshold = Math.max(absoluteMinimum, percentageThreshold);

        log.info("FIXED threshold: {} (uniqueWords={}, 15%={}, min={})",
                threshold, uniqueWords, percentageThreshold, absoluteMinimum);

        // Find words above threshold
        for (Map.Entry<String, Integer> entry : wordCounts.entrySet()) {
            if (entry.getValue() > threshold) {
                violations.add(new RuleViolation(
                        null, // No rule ID for statistical detection
                        "overuse_threshold",
                        "OVERUSE",
                        entry.getKey(),
                        entry.getValue(),
                        threshold,
                        String.format("'%s' appears %d times (max allowed: %d)",
                                entry.getKey(), entry.getValue(), threshold),
                        List.of() // No suggestions for statistical detection
                ));
            }
        }

        return violations;
    }

    /**
     * Evaluate a single rule against word counts.
     */
    private RuleViolation evaluateRule(GrammarRule rule, Map<String, Integer> wordCounts) {
        switch (rule.getRuleType()) {
            case OVERUSE -> {
                String target = rule.getTargetWord();
                if (target == null || target.isBlank()) {
                    return null;
                }

                int count = wordCounts.getOrDefault(target, 0);
                Integer threshold = rule.getThreshold();

                if (threshold != null && count > threshold) {
                    List<String> suggestions = ruleService.getSuggestionsForRule(rule.getId())
                            .stream()
                            .map(RuleSuggestion::getSuggestedWord)
                            .toList();

                    return new RuleViolation(
                            rule.getId(),
                            rule.getName(),
                            rule.getRuleType().name(),
                            target,
                            count,
                            threshold,
                            rule.getSuggestionText(),
                            suggestions);
                }
            }
            case MISSING -> {
                // TODO: Implement missing pattern detection
                // Check if a required tag/pattern is missing from worksheet
            }
            case REQUIRES -> {
                // TODO: Implement requires rule
                // Check if using X requires also using Y
            }
        }
        return null;
    }

    /**
     * Simplify POS tag to main category.
     * Example: "名詞-一般" -> "名詞"
     */
    private String simplifyPos(String pos) {
        if (pos == null || pos.isBlank()) {
            return null;
        }
        int dashIndex = pos.indexOf('-');
        return dashIndex > 0 ? pos.substring(0, dashIndex) : pos;
    }

    /**
     * Calculate score based on violations.
     */
    private int calculateScore(List<RuleViolation> violations, int totalWords) {
        if (totalWords == 0) {
            return 100;
        }

        // Start with 100, deduct points for each violation
        int score = 100;
        for (RuleViolation v : violations) {
            // Deduct more for higher threshold breaches
            int severity = Math.min(20, (v.actualCount() - v.threshold()) * 5);
            score -= severity;
        }

        return Math.max(0, Math.min(100, score));
    }
}
