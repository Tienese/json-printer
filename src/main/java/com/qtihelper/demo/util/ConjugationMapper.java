package com.qtihelper.demo.util;

import java.util.Map;
import static java.util.Map.entry;

/**
 * Maps Sudachi conjugation forms to friendly names for Grammar Coach
 * validation.
 * 
 * Responsibility: Centralized conjugation form mapping
 * Dependencies: None
 */
public class ConjugationMapper {

    // Sudachi conjugationForm → Friendly name mapping
    private static final Map<String, String> FORM_MAP = Map.ofEntries(
            // 終止形 (terminal form) - dictionary/plain form
            entry("終止形-一般", "plain"),
            entry("終止形-撥音便", "plain"),

            // 連用形 (continuative form) - masu stem, te-form base
            entry("連用形-一般", "masu-stem"),
            entry("連用形-促音便", "masu-stem"),
            entry("連用形-撥音便", "masu-stem"),
            entry("連用形-イ音便", "masu-stem"),

            // 未然形 (irrealis form) - nai-form base
            entry("未然形-一般", "nai-stem"),
            entry("未然形-サ", "nai-stem"),
            entry("未然形-セ", "nai-stem"),

            // 仮定形 (hypothetical form) - conditional
            entry("仮定形-一般", "conditional"),

            // 命令形 (imperative form)
            entry("命令形", "imperative"),

            // 意志推量形 (volitional form)
            entry("意志推量形", "volitional"));

    /**
     * Detect combined verb forms from surface patterns.
     * These forms are detected by analyzing the surface ending.
     *
     * @param surface     The surface form of the token
     * @param nextSurface The surface form of the next token (nullable)
     * @return The detected combined form name, or null if not detected
     */
    public static String detectCombinedForm(String surface, String nextSurface) {
        if (surface == null) {
            return null;
        }

        // Te-form: ends with て or で
        if (surface.endsWith("て") || surface.endsWith("で")) {
            return "te-form";
        }

        // Ta-form: ends with た or だ
        if (surface.endsWith("た") || surface.endsWith("だ")) {
            return "ta-form";
        }

        // Nai-form: ends with ない
        if (surface.endsWith("ない")) {
            return "nai-form";
        }

        // Masu-form: followed by ます
        if (nextSurface != null && nextSurface.equals("ます")) {
            return "masu-form";
        }

        return null;
    }

    /**
     * Map a Sudachi conjugation form to a friendly name.
     *
     * @param sudachiForm The Sudachi conjugationForm value
     * @return The friendly name, or the original form if not mapped
     */
    public static String mapToFriendly(String sudachiForm) {
        if (sudachiForm == null) {
            return null;
        }
        return FORM_MAP.getOrDefault(sudachiForm, sudachiForm);
    }

    /**
     * Check if a Sudachi form matches a required form.
     * Handles both direct mapping matches and partial string matches.
     *
     * @param sudachiForm  The Sudachi conjugationForm value
     * @param requiredForm The required form name (e.g., "te-form", "masu-stem")
     * @return true if the forms match
     */
    public static boolean matchesForm(String sudachiForm, String requiredForm) {
        if (sudachiForm == null || requiredForm == null) {
            return false;
        }

        // Try mapping to friendly name first
        String friendly = mapToFriendly(sudachiForm);
        if (friendly.equals(requiredForm)) {
            return true;
        }

        // Try partial match for edge cases
        return sudachiForm.contains(requiredForm);
    }
}
