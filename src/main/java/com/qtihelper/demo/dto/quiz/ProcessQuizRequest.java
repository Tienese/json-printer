package com.qtihelper.demo.dto.quiz;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for process quiz API.
 */
public record ProcessQuizRequest(
        @NotBlank(message = "Course ID is required") String courseId,
        @NotBlank(message = "Quiz JSON is required") String quizJson) {
}
