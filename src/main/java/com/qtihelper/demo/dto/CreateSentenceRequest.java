package com.qtihelper.demo.dto;

/**
 * Request for creating a new sentence.
 */
public record CreateSentenceRequest(
        String text,
        Integer lessonId,
        Boolean expectedValid,
        String notes) {
}
