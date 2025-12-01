package com.qtihelper.demo.parser.dto;

import java.util.List;

public record QuestionDto(
        String type,
        String title,
        String prompt,
        Double points,
        String generalFeedback,
        String correctFeedback,
        String incorrectFeedback,
        List<AnswerDto> answers,
        List<MatchingPairDto> matchingPairs,
        List<String> matchingDistractors) {
}