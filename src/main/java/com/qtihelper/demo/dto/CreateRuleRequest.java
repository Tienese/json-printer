package com.qtihelper.demo.dto;

/**
 * Request for creating a new grammar rule.
 */
public record CreateRuleRequest(
        String name,
        String ruleType,
        String particle,
        String pattern,
        Integer lessonId,
        String description) {
}
