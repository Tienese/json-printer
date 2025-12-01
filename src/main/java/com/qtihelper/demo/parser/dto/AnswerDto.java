package com.qtihelper.demo.parser.dto;

public record AnswerDto(
        String text,
        boolean correct,
        String feedback,
        String dropdownVariable) {
}