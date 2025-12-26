package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.*;
import com.qtihelper.demo.dto.GrammarCoachResult.*;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Grammar Coach v3.0 - Core analysis orchestrator.
 * Coordinates all analysis services to produce comprehensive grammar analysis.
 */
@Service
public class GrammarAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GrammarAnalysisService.class);

    private final WorksheetScannerService scannerService;
    private final SudachiTokenizerService tokenizerService;
    private final SlotDetectionService slotDetectionService;
    private final DistributionAnalysisService distributionService;
    private final ValidityCalculationService validityService;
    private final DiagnosticGeneratorService diagnosticService;
    private final VocabRepository vocabRepository;

    public GrammarAnalysisService(
            WorksheetScannerService scannerService,
            SudachiTokenizerService tokenizerService,
            SlotDetectionService slotDetectionService,
            DistributionAnalysisService distributionService,
            ValidityCalculationService validityService,
            DiagnosticGeneratorService diagnosticService,
            VocabRepository vocabRepository) {
        this.scannerService = scannerService;
        this.tokenizerService = tokenizerService;
        this.slotDetectionService = slotDetectionService;
        this.distributionService = distributionService;
        this.validityService = validityService;
        this.diagnosticService = diagnosticService;
        this.vocabRepository = vocabRepository;
    }

    /**
     * Analyze worksheet JSON for grammar patterns (v3.0).
     *
     * @param worksheetJson Full worksheet JSON string
     * @param lessonScope   Optional lesson scope for filtering
     * @return Grammar Coach analysis result
     */
    public GrammarCoachResult analyzeV3(String worksheetJson, LessonScope lessonScope) {
        log.info("Starting Grammar Coach v3.0 analysis");

        try {
            // Step 1: Get vocab pool for the scope
            List<Vocab> vocabPool = getVocabPool(lessonScope);
            Set<String> poolBaseForms = vocabPool.stream()
                    .map(Vocab::getBaseForm)
                    .collect(Collectors.toSet());

            if (vocabPool.isEmpty()) {
                return GrammarCoachResult.empty("No vocabulary found for the specified lesson scope.");
            }

            // Step 2: Extract text from worksheet
            List<String> textBlocks = scannerService.extractAllText(worksheetJson);
            if (textBlocks.isEmpty()) {
                return GrammarCoachResult.empty("No Japanese content found in worksheet.");
            }

            // Step 3: Tokenize and count words, track locations
            Map<String, Integer> wordCounts = new HashMap<>();
            Map<String, List<WordLocation>> wordLocations = new HashMap<>();
            List<SlotAssignment> allSlotAssignments = new ArrayList<>();
            int totalVocabWords = 0;
            int itemIndex = 0;

            for (String text : textBlocks) {
                List<SudachiTokenizerService.TokenResult> tokens = tokenizerService.tokenizeWithPos(text);

                // Count words in vocab pool
                for (SudachiTokenizerService.TokenResult token : tokens) {
                    if (poolBaseForms.contains(token.baseForm())) {
                        wordCounts.merge(token.baseForm(), 1, Integer::sum);
                        totalVocabWords++;

                        // Track locations
                        wordLocations.computeIfAbsent(token.baseForm(), k -> new ArrayList<>())
                                .add(new WordLocation(itemIndex, "TEXT", truncate(text, 30)));
                    }
                }

                // Detect slots
                List<SlotAssignment> slots = slotDetectionService.detectSlots(tokens, itemIndex);
                allSlotAssignments.addAll(slots);

                itemIndex++;
            }

            log.info("Analyzed {} text blocks, found {} vocab words ({} unique)",
                    textBlocks.size(), totalVocabWords, wordCounts.size());

            // Step 4: Calculate validity
            ValidityCalculationService.ValidityResult validity = validityService.calculate(wordCounts, lessonScope);

            // Step 5: Analyze distribution
            DistributionAnalysisService.DistributionResult distribution = distributionService.analyze(wordCounts,
                    lessonScope);

            // Step 6: Generate diagnostics
            List<Diagnostic> diagnostics = new ArrayList<>();

            // Overuse diagnostics
            diagnostics.addAll(diagnosticService.generateOveruseDiagnostics(
                    distribution.overused(), wordCounts, wordLocations, lessonScope, distribution.stdDev()));

            // Category imbalance diagnostics
            diagnostics.addAll(diagnosticService.generateCategoryDiagnostics(distribution.categoryBreakdown()));

            // Step 7: Analyze slots
            SlotDetectionService.SlotAnalysisSummary slotSummary = slotDetectionService
                    .analyzeSlotUsage(allSlotAssignments);
            String slotSummaryText = slotDetectionService.generateSlotSummary(slotSummary);

            // Step 8: Calculate score
            int scoreValue = diagnosticService.calculateScore(diagnostics, validity.level());
            String interpretation = diagnosticService.getScoreInterpretation(scoreValue);

            // Build result
            return new GrammarCoachResult(
                    new Meta(
                            validity.level(),
                            validity.note(),
                            lessonScope,
                            vocabPool.size(),
                            totalVocabWords),
                    new Distribution(
                            distribution.totalWords(),
                            distribution.uniqueWords(),
                            distribution.mean(),
                            distribution.stdDev(),
                            distribution.overuseThreshold(),
                            convertCategoryBreakdown(distribution.categoryBreakdown())),
                    diagnostics,
                    new SlotAnalysis(
                            slotSummary.slotCounts(),
                            slotSummary.missingSlots(),
                            slotSummaryText),
                    new Score(scoreValue, interpretation));

        } catch (Exception e) {
            log.error("Grammar analysis failed: {}", e.getMessage(), e);
            return GrammarCoachResult.empty("Analysis failed: " + e.getMessage());
        }
    }

    /**
     * Legacy v2.0 analyze method for backward compatibility.
     */
    public GrammarAnalysisResult analyze(String worksheetJson) {
        log.info("Starting grammar analysis (v2.0 compatibility mode)");

        // Use v3.0 internally and convert to v2.0 format
        GrammarCoachResult v3Result = analyzeV3(worksheetJson, null);

        // Convert to v2.0 format
        List<GrammarAnalysisResult.RuleViolation> violations = v3Result.diagnostics().stream()
                .filter(d -> "OVERUSE".equals(d.type()))
                .map(d -> new GrammarAnalysisResult.RuleViolation(
                        null,
                        d.type(),
                        d.severity(),
                        d.targetWord(),
                        d.actualCount(),
                        d.threshold(),
                        d.message(),
                        d.primarySuggestions().stream().map(Suggestion::word).toList()))
                .toList();

        return new GrammarAnalysisResult(
                v3Result.meta().wordsAnalyzed(),
                v3Result.distribution().uniqueWords(),
                List.of(), // POS counts not in v3.0
                violations,
                v3Result.score().value());
    }

    private List<Vocab> getVocabPool(LessonScope scope) {
        if (scope == null) {
            return vocabRepository.findAll();
        }
        return vocabRepository.findByLessonIdIn(scope.getLessonIds());
    }

    private Map<String, CategoryBreakdown> convertCategoryBreakdown(
            Map<String, DistributionAnalysisService.CategoryStats> stats) {
        Map<String, CategoryBreakdown> result = new HashMap<>();
        for (Map.Entry<String, DistributionAnalysisService.CategoryStats> entry : stats.entrySet()) {
            DistributionAnalysisService.CategoryStats s = entry.getValue();
            result.put(entry.getKey(), new CategoryBreakdown(s.poolSize(), s.used(), s.coverage()));
        }
        return result;
    }

    private String truncate(String text, int maxLen) {
        if (text == null)
            return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }
}
