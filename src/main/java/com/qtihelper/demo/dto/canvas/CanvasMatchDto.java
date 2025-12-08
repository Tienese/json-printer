package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CanvasMatchDto(
        @JsonProperty("match_id") Long matchId,
        String text,
        @JsonProperty("html") String html) {
}
