package com.qtihelper.demo.dto.quiz;

import com.qtihelper.demo.service.QuizImportManager;

/**
 * Response DTO for process quiz API.
 */
public record ProcessQuizResponse(
        boolean success,
        String message,
        UserQuizJson quiz,
        QuizImportManager.ImportResult importResult) {
}
