package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service to scan worksheet JSON and extract Japanese text content only.
 * IMPORTANT: Only extracts item CONTENT/ANSWERS, not question prompts.
 * Filters out non-Japanese text (e.g., Vietnamese prompts).
 */
@Service
public class WorksheetScannerService {

    private static final Logger log = LoggerFactory.getLogger(WorksheetScannerService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Regex to detect Japanese characters (Hiragana, Katakana, Kanji)
    private static final Pattern JAPANESE_PATTERN = Pattern.compile("[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]");

    /**
     * Extract Japanese-only text content from worksheet JSON.
     * Only extracts item VALUES/ANSWERS, NOT question prompts.
     *
     * @param worksheetJson The worksheet JSON string
     * @return List of Japanese text content found in the worksheet
     */
    public List<String> extractAllText(String worksheetJson) {
        List<String> textContent = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(worksheetJson);
            JsonNode pages = root.path("pages");

            if (pages.isArray()) {
                for (JsonNode page : pages) {
                    JsonNode items = page.path("items");
                    if (items.isArray()) {
                        for (JsonNode item : items) {
                            extractJapaneseFromItem(item, textContent);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse worksheet JSON for text extraction", e);
        }

        log.debug("Extracted {} Japanese text blocks from worksheet", textContent.size());
        return textContent;
    }

    /**
     * Extract ONLY Japanese content from worksheet items.
     * Ignores prompts (which are usually in Vietnamese or English).
     */
    private void extractJapaneseFromItem(JsonNode item, List<String> textContent) {
        String type = item.path("type").asText("");

        switch (type) {
            // VOCAB: Extract term only (Japanese), NO meaning (Vietnamese)
            case "VOCAB" -> extractVocabTerms(item, textContent);

            // GRID: Extract box values only (Japanese answers)
            case "GRID" -> extractGridBoxes(item, textContent);

            // MULTIPLE_CHOICE: Extract option texts only (Japanese answers), NO prompts
            case "MULTIPLE_CHOICE" -> extractMCOptions(item, textContent);

            // MATCHING: Extract match values only (Japanese answers), NO prompts
            case "MATCHING" -> extractMatchingMatches(item, textContent);

            // CLOZE: Extract passage (may contain Japanese)
            case "CLOZE" -> extractClozePassage(item, textContent);

            // TRUE_FALSE: Skip entirely (prompts only, no Japanese content)
            case "TRUE_FALSE" -> {
                /* Skip - only prompts */ }

            // HEADER: Skip entirely (metadata, not content)
            case "HEADER" -> {
                /* Skip */ }

            // CARD: May contain Japanese text
            case "CARD" -> addIfJapanese(item.path("content").asText(), textContent);

            default -> log.debug("Skipping unknown item type: {}", type);
        }
    }

    /**
     * VOCAB: Extract only the 'term' field (Japanese word).
     */
    private void extractVocabTerms(JsonNode item, List<String> textContent) {
        JsonNode terms = item.path("terms");
        if (terms.isArray()) {
            for (JsonNode term : terms) {
                // Only extract 'term' (Japanese), NOT 'meaning' (Vietnamese)
                addIfJapanese(term.path("term").asText(), textContent);
            }
        }
    }

    /**
     * GRID: Extract only box values (Japanese answers).
     */
    private void extractGridBoxes(JsonNode item, List<String> textContent) {
        JsonNode sections = item.path("sections");
        if (sections.isArray()) {
            for (JsonNode section : sections) {
                // Skip section labels (may be Vietnamese/English)
                JsonNode boxes = section.path("boxes");
                if (boxes.isArray()) {
                    for (JsonNode box : boxes) {
                        // TypeScript uses 'char', not 'value'
                        addIfJapanese(box.path("char").asText(), textContent);
                    }
                }
            }
        }
    }

    /**
     * MULTIPLE_CHOICE: Extract only option texts, NOT prompts.
     */
    private void extractMCOptions(JsonNode item, List<String> textContent) {
        JsonNode questions = item.path("questions");
        if (questions.isArray()) {
            for (JsonNode question : questions) {
                // Skip prompt - extract options only
                JsonNode options = question.path("options");
                if (options.isArray()) {
                    for (JsonNode option : options) {
                        addIfJapanese(option.path("text").asText(), textContent);
                    }
                }
            }
        }
    }

    /**
     * MATCHING: Extract only match values, NOT prompts.
     */
    private void extractMatchingMatches(JsonNode item, List<String> textContent) {
        JsonNode pairs = item.path("pairs");
        if (pairs.isArray()) {
            for (JsonNode pair : pairs) {
                // TypeScript uses 'left' and 'right', not 'match'
                addIfJapanese(pair.path("left").asText(), textContent);
                addIfJapanese(pair.path("right").asText(), textContent);
            }
        }
    }

    /**
     * CLOZE: Extract passage content.
     */
    private void extractClozePassage(JsonNode item, List<String> textContent) {
        // TypeScript uses 'template', not 'passage'
        addIfJapanese(item.path("template").asText(), textContent);
    }

    /**
     * Add text only if it contains Japanese characters.
     */
    private void addIfJapanese(String text, List<String> list) {
        if (text != null && !text.isBlank() && containsJapanese(text)) {
            list.add(text.trim());
        }
    }

    /**
     * Check if text contains any Japanese characters (Hiragana, Katakana, Kanji).
     */
    private boolean containsJapanese(String text) {
        return JAPANESE_PATTERN.matcher(text).find();
    }
}
