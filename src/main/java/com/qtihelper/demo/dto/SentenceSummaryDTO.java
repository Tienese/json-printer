package com.qtihelper.demo.dto;

/**
 * DTO for sentence summary in vocabulary detail.
 * 
 * Responsibility: Transfer sentence data linked to vocabulary
 * Dependencies: None
 */
public record SentenceSummaryDTO(
        Long id,
        String text,
        Integer lessonId,
        String validationStatus,
        String validationMessage) {
}
