package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CanvasQuizDto(
        Long id,
        String title,
        String description,
        @JsonProperty("question_count") Integer questionCount) {
}
