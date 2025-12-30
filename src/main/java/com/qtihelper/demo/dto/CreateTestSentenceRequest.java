package com.qtihelper.demo.dto;

/**
 * Request for creating a test sentence.
 */
public record CreateTestSentenceRequest(
        String text,
        String expectedResult // PASS or FAIL
) {
}
