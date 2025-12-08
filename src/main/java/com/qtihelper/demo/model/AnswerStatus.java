package com.qtihelper.demo.model;

/**
 * Represents the three possible states of a student's answer to a question.
 * This tri-state model is essential for B&W print reports where visual distinction
 * between "wrong" and "not attempted" matters for grading feedback.
 */
public enum AnswerStatus {
    /**
     * Student answered correctly - award full points
     */
    CORRECT,

    /**
     * Student answered incorrectly - award 0 points
     */
    INCORRECT,

    /**
     * Student did not answer (null/empty response) - award 0 points
     */
    UNANSWERED
}
