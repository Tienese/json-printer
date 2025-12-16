package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.StudentSubmission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrintReportGenerator {

    private static final Logger log = LoggerFactory.getLogger(PrintReportGenerator.class);

    public PrintReport generateReport(CanvasQuizDto quiz,
            List<CanvasQuestionDto> questions,
            List<StudentSubmission> submissions) {

        log.info("Starting report generation for quiz: {}", quiz.title());
        log.info("Processing {} students and {} questions", submissions.size(), questions.size());

        PrintReport report = new PrintReport();
        report.setQuizTitle(quiz.title());

        // Sort questions by position to ensure correct order
        // Handle null positions by using 0 as default
        List<CanvasQuestionDto> sortedQuestions = questions.stream()
                .sorted(Comparator.comparing(
                        q -> q.position() != null ? q.position() : 0))
                .toList();

        log.debug("Questions sorted by position: {}", sortedQuestions.stream()
                .map(q -> String.format("Q%s(%s)",
                        q.position() != null ? q.position() : "null",
                        q.questionType()))
                .toList());

        // Generate report for each student
        int studentCount = 0;
        for (StudentSubmission submission : submissions) {
            studentCount++;
            log.info("Processing student {}/{}: {} {} (ID: {})",
                    studentCount, submissions.size(),
                    submission.getFirstName(), submission.getLastName(), submission.getStudentId());

            PrintReport.StudentReport studentReport = new PrintReport.StudentReport();
            studentReport.setStudent(submission);

            int correctCount = 0;
            int totalAnswered = 0;

            // Process each question
            for (int i = 0; i < sortedQuestions.size(); i++) {
                CanvasQuestionDto question = sortedQuestions.get(i);
                int questionPosition = i + 1; // 1-based position

                log.debug("Evaluating question {} (type: {})", questionPosition, question.questionType());

                PrintReport.QuestionResult result = new PrintReport.QuestionResult();
                result.setQuestion(question);

                // Get student answer
                String studentAnswer = submission.getResponses().get(questionPosition);
                result.setStudentAnswer(studentAnswer != null ? studentAnswer : "No answer");

                if (studentAnswer != null && !studentAnswer.isEmpty()) {
                    totalAnswered++;
                }

                log.debug("Student answer for Q{}: {}", questionPosition,
                        studentAnswer != null && studentAnswer.length() > 100
                                ? studentAnswer.substring(0, 100) + "..."
                                : studentAnswer);

                // Determine correctness and feedback
                evaluateAnswer(question, studentAnswer, result);

                if (result.isCorrect()) {
                    correctCount++;
                }

                log.debug("Q{} evaluation: {}", questionPosition,
                        result.isCorrect() ? "CORRECT" : "INCORRECT");

                studentReport.getQuestionResults().add(result);
            }

            log.info("Student {} score: {}/{} correct ({} answered)",
                    submission.getStudentId(), correctCount, sortedQuestions.size(), totalAnswered);

            report.getStudentReports().add(studentReport);
        }

        log.info("Successfully generated report for {} students with {} questions each",
                submissions.size(), sortedQuestions.size());

        return report;
    }

    private void evaluateAnswer(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {

        String questionType = question.questionType();
        log.debug("Evaluating answer for question type: {}", questionType);

        switch (questionType) {
            case "multiple_choice_question", "true_false_question" -> {
                log.debug("Processing as multiple choice/true-false");
                evaluateMultipleChoice(question, studentAnswer, result);
            }
            case "multiple_answers_question" -> {
                log.debug("Processing as multiple answers");
                evaluateMultipleAnswers(question, studentAnswer, result);
            }
            case "multiple_dropdowns_question" -> {
                log.debug("Processing as multiple dropdowns");
                evaluateMultipleDropdowns(question, studentAnswer, result);
            }
            case "matching_question" -> {
                log.debug("Processing as matching question");
                evaluateMatching(question, studentAnswer, result);
            }
            default -> {
                log.warn("Unsupported question type: {}", questionType);
                result.setCorrect(false);
                result.setFeedbackToShow("Question type not supported: " + questionType);
            }
        }

        // Build comprehensive feedback
        buildFeedback(question, result);
    }

    private void evaluateMultipleChoice(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        if (question.answers() == null) {
            log.warn("Question has no answers defined");
            return;
        }

        // Find correct answer(s)
        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);
        log.debug("Correct answers: {}", correctTexts);

        // Check if student answer matches (simple string comparison)
        // Canvas exports as "A", "B", "C", "D" or full text
        boolean isCorrect = false;

        if (studentAnswer != null && !studentAnswer.isEmpty()) {
            // Try matching by letter (A, B, C, D)
            if (studentAnswer.length() == 1 && Character.isUpperCase(studentAnswer.charAt(0))) {
                int index = studentAnswer.charAt(0) - 'A';
                log.debug("Matching by letter: {} -> index {}", studentAnswer, index);
                if (index >= 0 && index < question.answers().size()) {
                    CanvasAnswerDto selectedAnswer = question.answers().get(index);
                    isCorrect = selectedAnswer.isCorrect();
                    log.debug("Selected answer '{}' is {}", stripHtml(selectedAnswer.text()),
                            isCorrect ? "CORRECT" : "INCORRECT");
                }
            } else {
                // Try matching by text
                log.debug("Matching by text: '{}'", studentAnswer);
                isCorrect = correctTexts.stream()
                        .anyMatch(ct -> ct.equalsIgnoreCase(studentAnswer.trim()));
            }
        } else {
            log.debug("No student answer provided");
        }

        result.setCorrect(isCorrect);
    }

    private void evaluateMultipleAnswers(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        // Multiple answers are typically comma-separated in CSV
        // e.g., "A,B,C" or "Answer1,Answer2"

        if (question.answers() == null) {
            log.warn("Question has no answers defined");
            return;
        }

        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);
        log.debug("Correct answers: {}", correctTexts);

        // Parse student's multiple answers
        if (studentAnswer == null || studentAnswer.isEmpty()) {
            log.debug("No student answer provided");
            result.setCorrect(false);
            return;
        }

        String[] studentAnswers = studentAnswer.split("[,;]");
        log.debug("Parsing {} student answers from: '{}'", studentAnswers.length, studentAnswer);

        List<String> studentList = new ArrayList<>();

        for (String ans : studentAnswers) {
            String trimmed = ans.trim();
            if (!trimmed.isEmpty()) {
                // Convert letter to text if needed
                if (trimmed.length() == 1 && Character.isUpperCase(trimmed.charAt(0))) {
                    int index = trimmed.charAt(0) - 'A';
                    if (index >= 0 && index < question.answers().size()) {
                        String answerText = stripHtml(question.answers().get(index).text());
                        studentList.add(answerText);
                        log.debug("Converted letter '{}' to answer: '{}'", trimmed, answerText);
                    }
                } else {
                    studentList.add(trimmed);
                }
            }
        }

        log.debug("Student selected {} answers: {}", studentList.size(), studentList);

        // Check if student selected exactly the correct answers
        boolean isCorrect = studentList.size() == correctTexts.size() &&
                studentList.stream().allMatch(s ->
                        correctTexts.stream().anyMatch(c -> c.equalsIgnoreCase(s)));

        log.debug("Multiple answers evaluation: {} (expected {} answers, got {})",
                isCorrect ? "CORRECT" : "INCORRECT", correctTexts.size(), studentList.size());

        result.setCorrect(isCorrect);
    }

    private void evaluateMultipleDropdowns(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        // Multiple dropdowns have multiple blanks, each with correct answer
        // CSV format might be: "answer1;answer2;answer3" or similar

        if (question.answers() == null)
            return;

        // Group correct answers by blank_id
        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> stripHtml(a.text()))
                .collect(Collectors.toList());

        result.setCorrectAnswers(correctTexts);

        // For now, do simple string matching
        // This might need refinement based on actual CSV format
        boolean isCorrect = studentAnswer != null &&
                correctTexts.stream().anyMatch(c -> studentAnswer.contains(c));

        result.setCorrect(isCorrect);
    }

    private void evaluateMatching(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        // Matching questions have pairs
        // Canvas exports might vary, but typically shows selected matches

        if (question.answers() == null)
            return;

        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> stripHtml(a.text()))
                .collect(Collectors.toList());

        result.setCorrectAnswers(correctTexts);

        // Simple correctness check
        boolean isCorrect = studentAnswer != null && !studentAnswer.isEmpty();
        result.setCorrect(isCorrect);
    }

    private void buildFeedback(CanvasQuestionDto question, PrintReport.QuestionResult result) {
        StringBuilder feedback = new StringBuilder();

        // Add general/neutral feedback first (shown to everyone)
        if (question.neutralComments() != null && !question.neutralComments().isEmpty()) {
            feedback.append("<div class='feedback-general'>")
                    .append(question.neutralComments())
                    .append("</div>");
        }

        // Add correct/incorrect specific feedback
        if (result.isCorrect()) {
            if (question.correctComments() != null && !question.correctComments().isEmpty()) {
                feedback.append("<div class='feedback-correct'>")
                        .append(question.correctComments())
                        .append("</div>");
            }
        } else {
            if (question.incorrectComments() != null && !question.incorrectComments().isEmpty()) {
                feedback.append("<div class='feedback-incorrect'>")
                        .append(question.incorrectComments())
                        .append("</div>");
            }
        }

        // Add answer-specific feedback if available
        if (question.answers() != null) {
            for (CanvasAnswerDto answer : question.answers()) {
                if (answer.comments() != null && !answer.comments().isEmpty()) {
                    String answerText = stripHtml(answer.text());
                    if (result.getStudentAnswer() != null &&
                            result.getStudentAnswer().contains(answerText)) {
                        feedback.append("<div class='feedback-answer-specific'>")
                                .append(answer.comments())
                                .append("</div>");
                    }
                }
            }
        }

        result.setFeedbackToShow(feedback.toString());
    }

    /**
     * Strips HTML tags from text while preserving meaningful content.
     * Detects images and equations and provides placeholders.
     *
     * @param text HTML text
     * @return Plain text without HTML tags, with placeholders for images/equations
     */
    private String stripHtml(String text) {
        if (text == null) {
            return "";
        }

        String result = text;

        // Detect and replace images with placeholder
        if (result.contains("<img")) {
            // Extract alt text if available, otherwise use generic placeholder
            result = result.replaceAll("<img[^>]*alt=[\"']([^\"']*)[\"'][^>]*>", "[Image: $1]");
            result = result.replaceAll("<img[^>]*>", "[Image]");
        }

        // Detect and replace MathML/LaTeX equations with placeholder
        if (result.contains("<math") || result.contains("\\(") || result.contains("\\[")) {
            result = result.replaceAll("<math[^>]*>.*?</math>", "[Equation]");
            result = result.replaceAll("\\\\\\([^\\)]*\\\\\\)", "[Equation]");
            result = result.replaceAll("\\\\\\[[^\\]]*\\\\\\]", "[Equation]");
        }

        // Detect Canvas equation images (common pattern)
        if (result.contains("equation_images")) {
            result = result.replaceAll("<img[^>]*equation_images[^>]*>", "[Equation]");
        }

        // Strip remaining HTML tags
        result = result.replaceAll("<[^>]*>", "").trim();

        // Decode common HTML entities
        result = result.replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'");

        // If result is empty or only whitespace after stripping, return a placeholder
        if (result.isEmpty()) {
            return "[No text content]";
        }

        return result.trim();
    }
}
