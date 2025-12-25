package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.GrammarAnalysisResult;
import com.qtihelper.demo.dto.GrammarAnalysisResult.PosCount;
import com.qtihelper.demo.dto.GrammarAnalysisResult.RuleViolation;
import com.qtihelper.demo.entity.GrammarRule;
import com.qtihelper.demo.entity.RuleSuggestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core analysis engine for the Language Coach.
 * Scans worksheet content, tokenizes Japanese text, and evaluates grammar
 * rules.
 */
@Service
public class GrammarAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GrammarAnalysisService.class);

    private final WorksheetScannerService scannerService;
    private final SudachiTokenizerService tokenizerService;
    private final GrammarRuleService ruleService;

    public GrammarAnalysisService(
            WorksheetScannerService scannerService,
            SudachiTokenizerService tokenizerService,
            GrammarRuleService ruleService) {
        this.scannerService = scannerService;
        this.tokenizerService = tokenizerService;
        this.ruleService = ruleService;
    }

    /**
     * Analyze worksheet JSON for grammar issues.
     *
     * @param worksheetJson Full worksheet JSON string
     * @return Analysis result with violations and suggestions
     */
    public GrammarAnalysisResult analyze(String worksheetJson) {
        log.info("Starting grammar analysis on worksheet");

        // Step 1: Extract all text from worksheet
        List<String> textBlocks = scannerService.extractAllText(worksheetJson);
        log.debug("Extracted {} text blocks from worksheet", textBlocks.size());

        // Step 2: Tokenize all text and count words/POS
        Map<String, Integer> wordCounts = new HashMap<>();
        Map<String, Integer> posCounts = new HashMap<>();
        int totalWords = 0;

        for (String text : textBlocks) {
            List<SudachiTokenizerService.TokenResult> tokens = tokenizerService.tokenizeWithPos(text);
            for (SudachiTokenizerService.TokenResult token : tokens) {
                // Count word occurrences (use base form for normalization)
                wordCounts.merge(token.baseForm(), 1, Integer::sum);

                // Count POS occurrences (simplify to main category)
                String posCategory = simplifyPos(token.pos());
                if (posCategory != null) {
                    posCounts.merge(posCategory, 1, Integer::sum);
                }

                totalWords++;
            }
        }

        log.debug("Tokenized {} total words, {} unique", totalWords, wordCounts.size());

        // Step 3: Evaluate grammar rules
        List<GrammarRule> enabledRules = ruleService.getEnabledRules();
        List<RuleViolation> violations = new ArrayList<>();

        for (GrammarRule rule : enabledRules) {
            RuleViolation violation = evaluateRule(rule, wordCounts);
            if (violation != null) {
                violations.add(violation);
            }
        }

        log.info("Found {} rule violations", violations.size());

        // Step 4: Calculate score (100 - penalty for each violation)
        int score = calculateScore(violations, totalWords);

        // Step 5: Build POS count list
        List<PosCount> posCountList = posCounts.entrySet().stream()
                .map(e -> new PosCount(e.getKey(), e.getValue()))
                .sorted((a, b) -> Integer.compare(b.count(), a.count()))
                .toList();

        return new GrammarAnalysisResult(
                totalWords,
                wordCounts.size(),
                posCountList,
                violations,
                score);
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
