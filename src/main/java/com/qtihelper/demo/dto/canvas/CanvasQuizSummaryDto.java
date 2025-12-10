package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Canvas quiz list items (summary view).
 * Contains metadata displayed in quiz browser.
 * Maps to GET /api/v1/courses/{id}/quizzes response.
 */
public record CanvasQuizSummaryDto(
    Long id,
    String title,
    String description,
    @JsonProperty("question_count") Integer questionCount,
    @JsonProperty("points_possible") Double pointsPossible,
    @JsonProperty("time_limit") Integer timeLimit,
    @JsonProperty("published") Boolean published,
    @JsonProperty("quiz_type") String quizType
) {}
