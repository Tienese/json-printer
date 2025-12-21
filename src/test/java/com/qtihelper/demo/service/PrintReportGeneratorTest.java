package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.StudentSubmission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PrintReportGeneratorTest {

        private PrintReportGenerator generator;

        @BeforeEach
        void setUp() {
                generator = new PrintReportGenerator();
        }

        @Test
        void generateReport_MultipleChoice_GradesCorrectly() {
                // Setup Quiz
                CanvasQuizDto quiz = new CanvasQuizDto(1L, "Math Quiz", "Desc", 1);

                // Setup Question
                List<CanvasAnswerDto> answers = List.of(
                                new CanvasAnswerDto(1L, "2", null, null, 100, null),
                                new CanvasAnswerDto(2L, "3", null, null, 0, null));
                CanvasQuestionDto q1 = new CanvasQuestionDto(101L, "Q1", "1+1?", "multiple_choice_question", 1, 1.0,
                                null, null,
                                null, answers, null);

                // Setup Submission
                StudentSubmission student = new StudentSubmission();
                student.setStudentId("S1");
                Map<Integer, String> responses = new HashMap<>();
                responses.put(1, "A"); // Option A is index 0 -> "2" -> Correct
                student.setResponses(responses);

                PrintReport report = generator.generateReport(quiz, List.of(q1), List.of(student), "full");

                assertEquals(1, report.getStudentReports().size());
                assertTrue(report.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());
        }

        @Test
        void generateReport_MultipleAnswers_GradesCorrectly() {
                CanvasQuizDto quiz = new CanvasQuizDto(1L, "MA Quiz", "Desc", 1);

                List<CanvasAnswerDto> answers = List.of(
                                new CanvasAnswerDto(1L, "Red", null, null, 100, null),
                                new CanvasAnswerDto(2L, "Blue", null, null, 100, null),
                                new CanvasAnswerDto(3L, "Green", null, null, 0, null));
                CanvasQuestionDto q1 = new CanvasQuestionDto(101L, "Q1", "Colors?", "multiple_answers_question", 1, 1.0,
                                null,
                                null, null, answers, null);

                StudentSubmission student = new StudentSubmission();
                student.setStudentId("S1");
                Map<Integer, String> responses = new HashMap<>();

                // Correct case: "A,B"
                responses.put(1, "A,B");
                student.setResponses(responses);
                PrintReport report1 = generator.generateReport(quiz, List.of(q1), List.of(student), "full");
                assertTrue(report1.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());

                // Incorrect case: "A"
                responses.put(1, "A");
                PrintReport report2 = generator.generateReport(quiz, List.of(q1), List.of(student), "full");
                assertFalse(report2.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());
        }

        @Test
        void stripHtml_HandlesImagesAndEntities() {
                CanvasQuizDto quiz = new CanvasQuizDto(1L, "Quiz", "Desc", 1);
                List<CanvasAnswerDto> answers = List.of(
                                new CanvasAnswerDto(1L, "<p>Option &amp; <b>Text</b></p>", null, null, 100, null));
                CanvasQuestionDto q1 = new CanvasQuestionDto(101L, "Q1", "Q", "multiple_choice_question", 1, 1.0, null,
                                null,
                                null, answers, null);

                StudentSubmission student = new StudentSubmission();
                student.setStudentId("S1");
                Map<Integer, String> responses = new HashMap<>();
                responses.put(1, "Option & Text"); // Stripped text
                student.setResponses(responses);

                PrintReport report = generator.generateReport(quiz, List.of(q1), List.of(student), "full");
                assertTrue(report.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());
        }

        @Test
        void generateReport_MultipleDropdowns_GradesCorrectly() {
                CanvasQuizDto quiz = new CanvasQuizDto(1L, "Dropdown Quiz", "Desc", 1);

                List<CanvasAnswerDto> answers = List.of(
                                new CanvasAnswerDto(1L, "cat", null, null, 100, null),
                                new CanvasAnswerDto(2L, "dog", null, null, 100, null));
                CanvasQuestionDto q1 = new CanvasQuestionDto(101L, "Q1", "Pets?", "multiple_dropdowns_question", 1, 1.0,
                                null,
                                null, null, answers, null);

                StudentSubmission student = new StudentSubmission();
                student.setStudentId("S1");
                Map<Integer, String> responses = new HashMap<>();

                // Correct case: "cat; dog"
                responses.put(1, "cat; dog");
                student.setResponses(responses);

                PrintReport report = generator.generateReport(quiz, List.of(q1), List.of(student), "full");
                assertTrue(report.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());
        }

        @Test
        void generateReport_Matching_GradesCorrectly() {
                CanvasQuizDto quiz = new CanvasQuizDto(1L, "Matching Quiz", "Desc", 1);

                List<CanvasAnswerDto> answers = List.of(
                                new CanvasAnswerDto(1L, "Left -> Right", null, null, 100, null));
                CanvasQuestionDto q1 = new CanvasQuestionDto(101L, "Q1", "Match?", "matching_question", 1, 1.0, null,
                                null,
                                null, answers, null);

                StudentSubmission student = new StudentSubmission();
                student.setStudentId("S1");
                Map<Integer, String> responses = new HashMap<>();

                // Partial match case
                responses.put(1, "Right");
                student.setResponses(responses);

                PrintReport report = generator.generateReport(quiz, List.of(q1), List.of(student), "full");
                assertTrue(report.getStudentReports().get(0).getQuestionResults().get(0).isCorrect());
        }
}
