package com.qtihelper.demo.dto;

/**
 * Request for creating a rule condition.
 */
public record CreateConditionRequest(
        String targetPosition,
        String conditionType,
        String conditionValue,
        String errorMessage,
        Boolean isRequired) {
}
