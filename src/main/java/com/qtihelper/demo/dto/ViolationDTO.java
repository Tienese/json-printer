package com.qtihelper.demo.dto;

/**
 * A single validation violation.
 * 
 * Responsibility: DTO for individual rule violations
 * Dependencies: None
 */
public record ViolationDTO(
        Long ruleId,
        String ruleName,
        String message,
        int position,
        String word) {
}
