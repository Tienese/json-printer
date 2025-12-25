package com.qtihelper.demo.dto;

import java.util.List;

/**
 * Result of style check analysis for a worksheet.
 */
public record StyleCheckResult(
        List<StyleIssue> issues,
        int score // 0-100
) {

    /**
     * Individual style issue found during analysis.
     */
    public record StyleIssue(
            String severity, // "error", "warning", "info"
            String message,
            String itemId) {
    }
}
