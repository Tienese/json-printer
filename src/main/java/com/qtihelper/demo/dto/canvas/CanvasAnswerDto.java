package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CanvasAnswerDto(
        Long id,
        String text,
        @JsonProperty("html") String html,
        String comments,
        @JsonProperty("weight") Integer weight,
        @JsonProperty("blank_id") String blankId) {
    
    public boolean isCorrect() {
        return weight != null && weight == 100;
    }
}
