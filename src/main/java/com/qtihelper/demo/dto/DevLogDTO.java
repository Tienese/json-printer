package com.qtihelper.demo.dto;

/**
 * DTO for creating a new DevLog entry.
 */
public record DevLogDTO(
        String sessionId,
        String level,
        String component,
        String action,
        String expected,
        String actual,
        String message,
        String stateSnapshot,
        String userAgent) {
    // Compact constructor for validation
    public DevLogDTO {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
        if (level == null || level.isBlank()) {
            throw new IllegalArgumentException("level is required");
        }
        if (component == null || component.isBlank()) {
            throw new IllegalArgumentException("component is required");
        }
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("action is required");
        }
    }
}
