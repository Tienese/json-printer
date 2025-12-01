package com.qtihelper.demo.parser.dto;

import java.util.List;

public record QuizDto(
        String title,
        String description,
        List<QuestionDto> questions) {
}