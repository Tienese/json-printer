package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service to scan worksheet JSON and extract all text content.
 * Uses the 1.1.1.1 unified input field structure for consistent scanning.
 */
@Service
public class WorksheetScannerService {

    private static final Logger log = LoggerFactory.getLogger(WorksheetScannerService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Extract all Japanese text content from a worksheet JSON.
     * Scans all item types: VOCAB, CARD, GRID, MULTIPLE_CHOICE, TRUE_FALSE,
     * MATCHING, CLOZE.
     *
     * @param worksheetJson The worksheet JSON string
     * @return List of text content found in the worksheet
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
                            extractTextFromItem(item, textContent);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse worksheet JSON for text extraction: {}", e.getMessage());
        }

        return textContent;
    }

    /**
     * Extract text from a single worksheet item based on its type.
     */
    private void extractTextFromItem(JsonNode item, List<String> textContent) {
        String type = item.path("type").asText("");

        switch (type) {
            case "VOCAB" -> extractVocabText(item, textContent);
            case "CARD" -> extractCardText(item, textContent);
            case "GRID" -> extractGridText(item, textContent);
            case "MULTIPLE_CHOICE" -> extractMultipleChoiceText(item, textContent);
            case "TRUE_FALSE" -> extractTrueFalseText(item, textContent);
            case "MATCHING" -> extractMatchingText(item, textContent);
            case "CLOZE" -> extractClozeText(item, textContent);
            case "HEADER" -> extractHeaderText(item, textContent);
            default -> log.debug("Unknown item type for text extraction: {}", type);
        }
    }

    private void extractVocabText(JsonNode item, List<String> textContent) {
        JsonNode terms = item.path("terms");
        if (terms.isArray()) {
            for (JsonNode term : terms) {
                addIfNotBlank(term.path("term").asText(), textContent);
                addIfNotBlank(term.path("meaning").asText(), textContent);
            }
        }
    }

    private void extractCardText(JsonNode item, List<String> textContent) {
        addIfNotBlank(item.path("content").asText(), textContent);
    }

    private void extractGridText(JsonNode item, List<String> textContent) {
        JsonNode sections = item.path("sections");
        if (sections.isArray()) {
            for (JsonNode section : sections) {
                addIfNotBlank(section.path("label").asText(), textContent);
                JsonNode boxes = section.path("boxes");
                if (boxes.isArray()) {
                    for (JsonNode box : boxes) {
                        addIfNotBlank(box.path("value").asText(), textContent);
                    }
                }
            }
        }
    }

    private void extractMultipleChoiceText(JsonNode item, List<String> textContent) {
        JsonNode questions = item.path("questions");
        if (questions.isArray()) {
            for (JsonNode question : questions) {
                addIfNotBlank(question.path("prompt").asText(), textContent);
                JsonNode options = question.path("options");
                if (options.isArray()) {
                    for (JsonNode option : options) {
                        addIfNotBlank(option.path("text").asText(), textContent);
                    }
                }
            }
        }
    }

    private void extractTrueFalseText(JsonNode item, List<String> textContent) {
        JsonNode questions = item.path("questions");
        if (questions.isArray()) {
            for (JsonNode question : questions) {
                addIfNotBlank(question.path("prompt").asText(), textContent);
            }
        }
    }

    private void extractMatchingText(JsonNode item, List<String> textContent) {
        JsonNode pairs = item.path("pairs");
        if (pairs.isArray()) {
            for (JsonNode pair : pairs) {
                addIfNotBlank(pair.path("prompt").asText(), textContent);
                addIfNotBlank(pair.path("match").asText(), textContent);
            }
        }
    }

    private void extractClozeText(JsonNode item, List<String> textContent) {
        addIfNotBlank(item.path("passage").asText(), textContent);
    }

    private void extractHeaderText(JsonNode item, List<String> textContent) {
        addIfNotBlank(item.path("title").asText(), textContent);
        addIfNotBlank(item.path("subtitle").asText(), textContent);
    }

    private void addIfNotBlank(String text, List<String> list) {
        if (text != null && !text.isBlank()) {
            list.add(text.trim());
        }
    }
}
