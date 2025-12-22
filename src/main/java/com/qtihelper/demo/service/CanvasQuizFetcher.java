package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import com.qtihelper.demo.dto.canvas.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class CanvasQuizFetcher {

    private static final Logger log = LoggerFactory.getLogger(CanvasQuizFetcher.class);

    public CanvasQuizFetcher(CanvasProperties props, RestClient.Builder builder) {
        log.info("Initializing MOCK Canvas API client");
    }

    public CanvasQuizDto getQuiz(String courseId, String quizId) {
        log.info("Fetching MOCK quiz {}/{}", courseId, quizId);
        return new CanvasQuizDto(
                Long.parseLong(quizId),
                "Mock Quiz for Design Review",
                "<p>This is a mock quiz description.</p>",
                5
        );
    }

    public List<CanvasQuestionDto> getQuizQuestions(String courseId, String quizId) {
        log.info("Fetching MOCK questions for quiz {}/{}", courseId, quizId);
        List<CanvasQuestionDto> questions = new ArrayList<>();

        // Question 1: Multiple Choice (Correct)
        questions.add(new CanvasQuestionDto(
                1L,
                "Question 1",
                "<p>What is the capital of France?</p>",
                "multiple_choice_question",
                1,
                1.0,
                "<p>Correct!</p>",
                "<p>Incorrect.</p>",
                "<p>General feedback.</p>",
                List.of(
                        new CanvasAnswerDto(1L, "London", "", "", 0, null),
                        new CanvasAnswerDto(2L, "Paris", "", "", 100, null),
                        new CanvasAnswerDto(3L, "Berlin", "", "", 0, null),
                        new CanvasAnswerDto(4L, "Madrid", "", "", 0, null)
                ),
                null
        ));

        // Question 2: Multiple Choice (Incorrect)
        questions.add(new CanvasQuestionDto(
                2L,
                "Question 2",
                "<p>Which planet is known as the Red Planet?</p>",
                "multiple_choice_question",
                2,
                1.0,
                "<p>Yes, Mars is red.</p>",
                "<p>No, try again.</p>",
                null,
                List.of(
                        new CanvasAnswerDto(5L, "Venus", "", "", 0, null),
                        new CanvasAnswerDto(6L, "Mars", "", "", 100, null),
                        new CanvasAnswerDto(7L, "Jupiter", "", "", 0, null)
                ),
                null
        ));

        // Question 3: True/False (Correct)
        questions.add(new CanvasQuestionDto(
                3L,
                "Question 3",
                "<p>The sun rises in the east.</p>",
                "true_false_question",
                3,
                1.0,
                null,
                null,
                null,
                List.of(
                        new CanvasAnswerDto(8L, "True", "", "", 100, null),
                        new CanvasAnswerDto(9L, "False", "", "", 0, null)
                ),
                null
        ));

        // Question 4: Multiple Answers
        questions.add(new CanvasQuestionDto(
                4L,
                "Question 4",
                "<p>Select all prime numbers.</p>",
                "multiple_answers_question",
                4,
                1.0,
                null,
                null,
                null,
                List.of(
                        new CanvasAnswerDto(10L, "2", "", "", 100, null),
                        new CanvasAnswerDto(11L, "3", "", "", 100, null),
                        new CanvasAnswerDto(12L, "4", "", "", 0, null),
                        new CanvasAnswerDto(13L, "5", "", "", 100, null)
                ),
                null
        ));

        return questions;
    }

    public List<CanvasCourseDto> getCourses() {
        return List.of();
    }

    public List<CanvasQuizSummaryDto> getQuizzes(String courseId) {
        return List.of();
    }
}
