package com.qtihelper.demo.dto.quiz;

/**
 * Response DTO for parse quiz API.
 */
public record ParseQuizResponse(UserQuizJson quiz, int questionCount) {
}
