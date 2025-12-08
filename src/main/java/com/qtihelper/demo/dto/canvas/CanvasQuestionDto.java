package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CanvasQuestionDto(
        Long id,
        @JsonProperty("question_name") String questionName,
        @JsonProperty("question_text") String questionText,
        @JsonProperty("question_type") String questionType,
        @JsonProperty("position") Integer position,
        @JsonProperty("points_possible") Double pointsPossible,
        @JsonProperty("correct_comments") String correctComments,
        @JsonProperty("incorrect_comments") String incorrectComments,
        @JsonProperty("neutral_comments") String neutralComments,
        @JsonProperty("answers") List<CanvasAnswerDto> answers,
        @JsonProperty("matches") List<CanvasMatchDto> matches) {
}
