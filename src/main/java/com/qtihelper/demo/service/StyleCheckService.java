package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.StyleCheckResult;
import com.qtihelper.demo.dto.StyleCheckResult.StyleIssue;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for checking worksheet style and layout issues.
 * Analyzes JSON content and reports potential print/display problems.
 */
@Service
public class StyleCheckService {

    private final ObjectMapper objectMapper;

    public StyleCheckService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Check worksheet content for style issues.
     * 
     * @param worksheetJson Full worksheet JSON content
     * @return StyleCheckResult with issues list and score
     */
    public StyleCheckResult check(String worksheetJson) {
        List<StyleIssue> issues = new ArrayList<>();

        try {
            var root = objectMapper.readTree(worksheetJson);
            var pages = root.path("pages");

            int pageIndex = 0;
            for (var page : pages) {
                var items = page.path("items");
                int itemIndex = 0;

                for (var item : items) {
                    checkItem(item, issues, pageIndex, itemIndex);
                    itemIndex++;
                }
                pageIndex++;
            }
        } catch (Exception e) {
            issues.add(new StyleIssue("error", "Failed to parse worksheet: " + e.getMessage(), null));
        }

        // Score: 100 minus 10 per issue, minimum 0
        int score = Math.max(0, 100 - issues.size() * 10);
        return new StyleCheckResult(issues, score);
    }

    private void checkItem(JsonNode item, List<StyleIssue> issues, int pageIndex, int itemIndex) {
        String type = item.path("type").asText();
        String id = item.path("id").asText();
        String location = "Page " + (pageIndex + 1) + ", Item " + (itemIndex + 1);

        // Check: Empty CARD content
        if ("CARD".equals(type)) {
            String content = item.path("content").asText("");
            if (content.isBlank()) {
                issues.add(new StyleIssue("warning", location + ": Empty card block", id));
            }
        }

        // Check: VOCAB with no terms
        if ("VOCAB".equals(type)) {
            var terms = item.path("terms");
            if (terms.isEmpty() || !terms.isArray() || terms.size() == 0) {
                issues.add(new StyleIssue("warning", location + ": Vocabulary list has no terms", id));
            }
        }

        // Check: GRID with no sections
        if ("GRID".equals(type)) {
            var sections = item.path("sections");
            if (sections.isEmpty() || !sections.isArray() || sections.size() == 0) {
                issues.add(new StyleIssue("warning", location + ": Grid has no sections", id));
            }
        }

        // Check: Missing prompt number when feature is enabled
        if (item.path("showPromptNumber").asBoolean(false)) {
            if (!item.has("promptNumber") || item.path("promptNumber").isNull()) {
                issues.add(new StyleIssue("info", location + ": Prompt number enabled but not set", id));
            }
        }

        // Check: MULTIPLE_CHOICE with less than 2 options
        if ("MULTIPLE_CHOICE".equals(type)) {
            var options = item.path("options");
            if (options.isArray() && options.size() < 2) {
                issues.add(new StyleIssue("warning", location + ": Multiple choice needs at least 2 options", id));
            }
        }

        // Check: TRUE_FALSE with no questions
        if ("TRUE_FALSE".equals(type)) {
            var questions = item.path("questions");
            if (questions.isEmpty() || !questions.isArray() || questions.size() == 0) {
                issues.add(new StyleIssue("warning", location + ": True/False has no questions", id));
            }
        }

        // Check: MATCHING with less than 2 pairs
        if ("MATCHING".equals(type)) {
            var pairs = item.path("pairs");
            if (pairs.isArray() && pairs.size() < 2) {
                issues.add(new StyleIssue("warning", location + ": Matching needs at least 2 pairs", id));
            }
        }
    }
}
