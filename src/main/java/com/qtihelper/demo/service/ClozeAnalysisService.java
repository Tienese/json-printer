package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.LessonScope;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for analyzing cloze (fill-in-the-blank) questions.
 * Detects blanks, infers expected slot from particles, and suggests answers.
 */
@Service
public class ClozeAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ClozeAnalysisService.class);

    // Patterns to detect blanks in cloze questions
    private static final Pattern BLANK_PATTERN = Pattern.compile(
            "＿{2,}|_{2,}|【\\s*】|（\\s*）|\\(\\s*\\)|\\[\\s*\\]");

    // Common particles and their slot mappings (aligned with slot_definitions.json)
    private static final Map<String, String> PARTICLE_TO_SLOT = Map.ofEntries(
            Map.entry("を", "OBJECT"),
            Map.entry("に", "DIRECTION"), // Default for に (also TIME in some contexts)
            Map.entry("で", "LOCATION"), // Default for で (also INSTRUMENT in some contexts)
            Map.entry("へ", "DIRECTION"),
            Map.entry("と", "COMPANION"),
            Map.entry("から", "SOURCE"),
            Map.entry("まで", "GOAL"),
            Map.entry("は", "SUBJECT"),
            Map.entry("が", "SUBJECT"));

    private final VocabRepository vocabRepository;
    private final SudachiTokenizerService tokenizerService;

    public ClozeAnalysisService(VocabRepository vocabRepository,
            SudachiTokenizerService tokenizerService) {
        this.vocabRepository = vocabRepository;
        this.tokenizerService = tokenizerService;
    }

    /**
     * Analyze a cloze passage for blanks.
     *
     * @param template    The cloze template with blanks
     * @param lessonScope Optional lesson scope for suggestions
     * @return List of blank analysis results
     */
    public List<BlankAnalysis> analyzeTemplate(String template, LessonScope lessonScope) {
        if (template == null || template.isBlank()) {
            return List.of();
        }

        List<BlankAnalysis> blanks = new ArrayList<>();
        Matcher matcher = BLANK_PATTERN.matcher(template);

        int blankIndex = 0;
        while (matcher.find()) {
            int blankStart = matcher.start();
            int blankEnd = matcher.end();

            // Get context around blank
            String before = template.substring(0, blankStart);
            String after = template.substring(blankEnd);

            // Find particle after blank
            String particleAfter = extractFirstParticle(after);
            String inferredSlot = particleAfter != null ? PARTICLE_TO_SLOT.get(particleAfter) : null;

            // Find verb in context for more precise suggestions
            String contextVerb = findVerbInContext(after);

            // Generate suggestions based on slot
            List<String> suggestions = generateSuggestions(inferredSlot, contextVerb, lessonScope);

            blanks.add(new BlankAnalysis(
                    blankIndex++,
                    blankStart,
                    blankEnd,
                    particleAfter,
                    inferredSlot,
                    contextVerb,
                    suggestions.subList(0, Math.min(5, suggestions.size())),
                    truncate(before, 20),
                    truncate(after, 20)));

            log.debug("Found blank at {}: particle={}, slot={}, verb={}",
                    blankStart, particleAfter, inferredSlot, contextVerb);
        }

        log.info("Analyzed cloze template: found {} blanks", blanks.size());
        return blanks;
    }

    /**
     * Extract the first particle from text.
     */
    private String extractFirstParticle(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        // Tokenize and find first particle
        List<SudachiTokenizerService.TokenResult> tokens = tokenizerService.tokenizeWithPos(text);
        for (SudachiTokenizerService.TokenResult token : tokens) {
            if (token.pos() != null && token.pos().startsWith("助詞")) {
                return token.surface();
            }
            // Stop after first content word (blank answer would be before it)
            if (token.pos() != null && !token.pos().startsWith("助詞") && !token.pos().startsWith("記号")) {
                break;
            }
        }
        return null;
    }

    /**
     * Find verb in context for semantic suggestions.
     */
    private String findVerbInContext(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        List<SudachiTokenizerService.TokenResult> tokens = tokenizerService.tokenizeWithPos(text);
        for (SudachiTokenizerService.TokenResult token : tokens) {
            if (token.pos() != null && token.pos().startsWith("動詞")) {
                return token.baseForm();
            }
        }
        return null;
    }

    /**
     * Generate suggestions based on inferred slot and context.
     */
    private List<String> generateSuggestions(String slot, String verb, LessonScope lessonScope) {
        // Get vocab pool
        List<Vocab> pool = lessonScope != null
                ? vocabRepository.findByLessonIdIn(lessonScope.getLessonIds())
                : vocabRepository.findAll();

        // Filter by category based on slot
        String targetCategory = getTargetCategory(slot);

        if (targetCategory != null) {
            pool = pool.stream()
                    .filter(v -> targetCategory.equals(v.getCategory()))
                    .collect(Collectors.toList());
        }

        // If we know the verb, could further filter by aspects (future enhancement)
        // For now, just return words from the matching category

        return pool.stream()
                .map(Vocab::getBaseForm)
                .distinct()
                .limit(10)
                .toList();
    }

    /**
     * Map slot to expected category.
     */
    private String getTargetCategory(String slot) {
        if (slot == null)
            return null;

        return switch (slot) {
            case "SUBJECT", "COMPANION" -> "person";
            case "OBJECT" -> "thing";
            case "LOCATION", "DIRECTION", "SOURCE", "GOAL" -> "place";
            case "TIME" -> "time";
            default -> null;
        };
    }

    private String truncate(String text, int maxLen) {
        if (text == null)
            return "";
        String trimmed = text.trim();
        return trimmed.length() > maxLen ? "..." + trimmed.substring(Math.max(0, trimmed.length() - maxLen)) : trimmed;
    }

    /**
     * Result of analyzing a single blank in a cloze question.
     */
    public record BlankAnalysis(
            int blankIndex,
            int startPos,
            int endPos,
            String particleAfter,
            String inferredSlot,
            String contextVerb,
            List<String> suggestedAnswers,
            String beforeContext,
            String afterContext) {
    }
}
