package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.VocabAnalysisResult;
import com.qtihelper.demo.dto.VocabAnalysisResult.MissingWord;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for analyzing worksheet vocabulary coverage against lesson
 * vocabulary.
 * The "Brain" of the gap analysis system.
 */
@Service
public class WorksheetAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(WorksheetAnalysisService.class);

    private final VocabRepository vocabRepository;
    private final SudachiTokenizerService tokenizerService;
    private final ObjectMapper objectMapper;

    public WorksheetAnalysisService(
            VocabRepository vocabRepository,
            SudachiTokenizerService tokenizerService,
            ObjectMapper objectMapper) {
        this.vocabRepository = vocabRepository;
        this.tokenizerService = tokenizerService;
        this.objectMapper = objectMapper;
    }

    /**
     * Analyze worksheet content against target lesson vocabulary.
     *
     * @param worksheetJson The full worksheet JSON content
     * @param lessonIds     List of lesson IDs to check against (e.g., [1] or
     *                      [1,2,3])
     * @return Analysis result with coverage stats and missing words
     */
    public VocabAnalysisResult analyze(String worksheetJson, List<Integer> lessonIds) {
        log.info("Starting vocabulary analysis for lessons: {}", lessonIds);

        // STEP A: Load truth source from DB
        List<Vocab> truthVocab = vocabRepository.findByLessonIdIn(lessonIds);
        if (truthVocab.isEmpty()) {
            log.warn("No vocabulary found for lessons: {}", lessonIds);
            return new VocabAnalysisResult(0, 0, 0, List.of());
        }

        Set<String> truthBaseForms = truthVocab.stream()
                .map(Vocab::getBaseForm)
                .collect(Collectors.toSet());
        log.debug("Loaded {} unique vocab base forms from DB", truthBaseForms.size());

        // STEP B: Extract all text from worksheet JSON
        String allText = extractTextFromWorksheet(worksheetJson);
        log.debug("Extracted {} characters of text from worksheet", allText.length());

        // STEP C: Tokenize and normalize worksheet text
        List<String> inputBaseForms = tokenizerService.tokenize(allText);
        Set<String> uniqueInputForms = new HashSet<>(inputBaseForms);
        log.debug("Tokenized worksheet into {} unique base forms", uniqueInputForms.size());

        // STEP D: Compare - find intersection (used) and difference (missing)
        Set<String> used = new HashSet<>(truthBaseForms);
        used.retainAll(uniqueInputForms); // Intersection

        Set<String> missingBaseForms = new HashSet<>(truthBaseForms);
        missingBaseForms.removeAll(uniqueInputForms); // Difference

        // STEP E: Build result
        int coveragePercent = truthBaseForms.isEmpty() ? 0 : (used.size() * 100) / truthBaseForms.size();

        List<MissingWord> missingWords = buildMissingList(missingBaseForms, truthVocab);

        log.info("Analysis complete: {}% coverage ({}/{} words, {} missing)",
                coveragePercent, used.size(), truthBaseForms.size(), missingWords.size());

        return new VocabAnalysisResult(
                coveragePercent,
                truthVocab.size(),
                used.size(),
                missingWords);
    }

    /**
     * Extract all analyzable text from worksheet JSON.
     * Traverses pages[].items[] and extracts text based on item type.
     */
    private String extractTextFromWorksheet(String worksheetJson) {
        StringBuilder allText = new StringBuilder();

        try {
            JsonNode root = objectMapper.readTree(worksheetJson);

            // Handle both legacy (pages array) and new format
            JsonNode pages = root.has("pages") ? root.get("pages") : null;
            if (pages != null && pages.isArray()) {
                for (JsonNode page : pages) {
                    JsonNode items = page.get("items");
                    if (items != null && items.isArray()) {
                        for (JsonNode item : items) {
                            extractTextFromItem(item, allText);
                        }
                    }
                }
            }

            // Also check for legacy "items" at root level
            if (root.has("items") && root.get("items").isArray()) {
                for (JsonNode item : root.get("items")) {
                    extractTextFromItem(item, allText);
                }
            }

        } catch (Exception e) {
            log.error("Failed to parse worksheet JSON: {}", e.getMessage());
        }

        return allText.toString();
    }

    /**
     * Extract text from a single worksheet item based on its type.
     */
    private void extractTextFromItem(JsonNode item, StringBuilder allText) {
        String type = item.has("type") ? item.get("type").asText() : "";

        switch (type) {
            case "MULTIPLE_CHOICE" -> {
                appendIfPresent(item, "prompt", allText);
                JsonNode options = item.get("options");
                if (options != null && options.isArray()) {
                    for (JsonNode option : options) {
                        allText.append(" ").append(option.asText());
                    }
                }
            }
            case "TRUE_FALSE" -> {
                appendIfPresent(item, "prompt", allText);
                JsonNode questions = item.get("questions");
                if (questions != null && questions.isArray()) {
                    for (JsonNode q : questions) {
                        appendIfPresent(q, "text", allText);
                    }
                }
            }
            case "MATCHING" -> {
                appendIfPresent(item, "prompt", allText);
                JsonNode pairs = item.get("pairs");
                if (pairs != null && pairs.isArray()) {
                    for (JsonNode pair : pairs) {
                        appendIfPresent(pair, "left", allText);
                        appendIfPresent(pair, "right", allText);
                    }
                }
            }
            case "CLOZE" -> {
                appendIfPresent(item, "template", allText);
                JsonNode answers = item.get("answers");
                if (answers != null && answers.isArray()) {
                    for (JsonNode answer : answers) {
                        allText.append(" ").append(answer.asText());
                    }
                }
            }
            case "VOCAB" -> {
                appendIfPresent(item, "description", allText);
                JsonNode terms = item.get("terms");
                if (terms != null && terms.isArray()) {
                    for (JsonNode term : terms) {
                        appendIfPresent(term, "term", allText);
                        appendIfPresent(term, "meaning", allText);
                    }
                }
            }
            case "GRID" -> {
                appendIfPresent(item, "description", allText);
                JsonNode sections = item.get("sections");
                if (sections != null && sections.isArray()) {
                    for (JsonNode section : sections) {
                        JsonNode boxes = section.get("boxes");
                        if (boxes != null && boxes.isArray()) {
                            for (JsonNode box : boxes) {
                                appendIfPresent(box, "char", allText);
                            }
                        }
                    }
                }
            }
            case "HEADER" -> appendIfPresent(item, "title", allText);
            case "CARD" -> appendIfPresent(item, "content", allText);
            default -> {
                // Unknown type, skip
            }
        }
    }

    /**
     * Helper to append a field value to the text builder if present.
     */
    private void appendIfPresent(JsonNode node, String field, StringBuilder builder) {
        if (node.has(field) && !node.get(field).isNull()) {
            builder.append(" ").append(node.get(field).asText());
        }
    }

    /**
     * Build list of missing words with both display and base forms.
     */
    private List<MissingWord> buildMissingList(Set<String> missingBaseForms, List<Vocab> truthVocab) {
        // Map base form back to display form
        Map<String, String> baseToDisplay = truthVocab.stream()
                .collect(Collectors.toMap(
                        Vocab::getBaseForm,
                        Vocab::getDisplayForm,
                        (a, b) -> a // Keep first if duplicate base forms
                ));

        return missingBaseForms.stream()
                .map(baseForm -> new MissingWord(
                        baseToDisplay.getOrDefault(baseForm, baseForm),
                        baseForm))
                .sorted(Comparator.comparing(MissingWord::displayForm))
                .collect(Collectors.toList());
    }
}
