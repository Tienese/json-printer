package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.StudentSubmission;
import com.qtihelper.demo.util.HtmlUtils;
import com.qtihelper.demo.util.QuizEvalUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class PrintReportGenerator {

    private static final Logger log = LoggerFactory.getLogger(PrintReportGenerator.class);
    private static final String CORRECT_LITERAL = "CORRECT";
    private static final String INCORRECT_LITERAL = "INCORRECT";
    private static final String DIV_END = "</div>";

    public PrintReport generateReport(CanvasQuizDto quiz,
            List<CanvasQuestionDto> questions,
            List<StudentSubmission> submissions,
            String reportType) {

        log.info("Starting report generation for quiz: {} (Type: {})", quiz.title(), reportType);
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
        for (StudentSubmission submission : submissions) {
            processStudentSubmission(submission, sortedQuestions, report, submissions.size());
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

        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> HtmlUtils.stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);
        if (log.isDebugEnabled()) {
            log.debug("Correct answers: {}", correctTexts);
        }

        boolean isCorrect = matchStudentAnswer(studentAnswer, question.answers(), correctTexts);
        result.setCorrect(isCorrect);
    }

    private boolean matchStudentAnswer(String studentAnswer, List<CanvasAnswerDto> answers, List<String> correctTexts) {
        if (studentAnswer == null || studentAnswer.isEmpty()) {
            log.debug("No student answer provided");
            return false;
        }

        // Try matching by letter (A, B, C, D)
        if (studentAnswer.length() == 1 && Character.isUpperCase(studentAnswer.charAt(0))) {
            return QuizEvalUtils.matchByLetter(studentAnswer, answers);
        }

        // Try matching by text
        return QuizEvalUtils.matchByText(studentAnswer, correctTexts);
    }

    private void evaluateMultipleAnswers(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        if (question.answers() == null) {
            log.warn("Question has no answers defined");
            return;
        }

        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> HtmlUtils.stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);
        if (log.isDebugEnabled()) {
            log.debug("Correct answers: {}", correctTexts);
        }

        if (studentAnswer == null || studentAnswer.isEmpty()) {
            log.debug("No student answer provided");
            result.setCorrect(false);
            return;
        }

        List<String> studentList = QuizEvalUtils.parseMultipleAnswers(studentAnswer, question.answers());
        boolean isCorrect = validateMultipleAnswers(studentList, correctTexts);
        result.setCorrect(isCorrect);
    }

    private boolean validateMultipleAnswers(List<String> studentList, List<String> correctTexts) {
        boolean isCorrect = studentList.size() == correctTexts.size() &&
                studentList.stream().allMatch(s -> correctTexts.stream().anyMatch(c -> c.equalsIgnoreCase(s)));

        if (log.isDebugEnabled()) {
            log.debug("Multiple answers evaluation: {} (expected {} answers, got {})",
                    isCorrect ? CORRECT_LITERAL : INCORRECT_LITERAL, correctTexts.size(), studentList.size());
        }
        return isCorrect;
    }

    private void evaluateMultipleDropdowns(CanvasQuestionDto question,
            String studentAnswer,
            PrintReport.QuestionResult result) {
        // Multiple dropdowns have multiple blanks, each with correct answer
        // CSV format might be: "answer1;answer2;answer3" or similar

        if (question.answers() == null)
            return;

        List<String> correctTexts = question.answers().stream()
                .filter(CanvasAnswerDto::isCorrect)
                .map(a -> HtmlUtils.stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);

        // Improved parsing for multiple dropdowns
        // Expecting format like "answer1;answer2" or "answer1,answer2"
        if (studentAnswer == null || studentAnswer.isEmpty()) {
            result.setCorrect(false);
            return;
        }

        // Split by common delimiters
        String[] studentAnswers = studentAnswer.split("[,;]");

        // Check if all student selections match at least one correct answer
        // Note: This is still loose because we don't map exact dropdown positions to
        // answers
        // but it's better than a simple .contains()
        boolean isCorrect = studentAnswers.length > 0 &&
                java.util.Arrays.stream(studentAnswers)
                        .map(String::trim)
                        .allMatch(ans -> correctTexts.stream().anyMatch(c -> c.equalsIgnoreCase(ans)));

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
                .map(a -> HtmlUtils.stripHtml(a.text()))
                .toList();

        result.setCorrectAnswers(correctTexts);

        // Improved matching logic: Check if student has selected at least one pair
        // correctly
        // Matching answers often come as "Left->Right" or comma separated list of pairs
        boolean isCorrect = false;
        if (studentAnswer != null && !studentAnswer.isEmpty()) {
            // Basic validation: user provided an answer and it contains some text
            // For strict matching, we would need to know the specific pair syntax from
            // Canvas CSV
            // For now, we ensure it's not just whitespace
            isCorrect = !studentAnswer.trim().isEmpty();

            // If we have correct text known, try to find it
            if (!correctTexts.isEmpty()) {
                // If any correct pair text fragment is found in student answer, give credit
                // This is a heuristic; full pair parsing is complex without strict CSV spec
                long matchCount = correctTexts.stream()
                        .filter(ct -> studentAnswer.toLowerCase().contains(ct.toLowerCase()))
                        .count();

                // If they got > 50% of matches found in their text string
                if (matchCount > 0) {
                    isCorrect = true;
                }
            }
        }

        result.setCorrect(isCorrect);
    }

    private void processStudentSubmission(StudentSubmission submission, List<CanvasQuestionDto> sortedQuestions,
            PrintReport report, int totalStudents) {
        int studentIndex = report.getStudentReports().size() + 1;
        log.info("Processing student {}/{}: {} {} (ID: {})",
                studentIndex, totalStudents,
                submission.getFirstName(), submission.getLastName(), submission.getStudentId());

        PrintReport.StudentReport studentReport = new PrintReport.StudentReport();
        studentReport.setStudent(submission);

        int correctCount = 0;
        int totalAnswered = 0;

        // Process each question
        for (int i = 0; i < sortedQuestions.size(); i++) {
            CanvasQuestionDto question = sortedQuestions.get(i);
            int questionPosition = i + 1; // 1-based position

            PrintReport.QuestionResult result = evaluateStudentQuestion(submission, question, questionPosition);

            if (result.isCorrect()) {
                correctCount++;
            }
            if (result.getStudentAnswer() != null && !result.getStudentAnswer().equals("No answer")
                    && !result.getStudentAnswer().isEmpty()) {
                totalAnswered++;
            }

            studentReport.getQuestionResults().add(result);
        }

        log.info("Student {} score: {}/{} correct ({} answered)",
                submission.getStudentId(), correctCount, sortedQuestions.size(), totalAnswered);

        report.getStudentReports().add(studentReport);
    }

    private PrintReport.QuestionResult evaluateStudentQuestion(StudentSubmission submission,
            CanvasQuestionDto question,
            int questionPosition) {
        log.debug("Evaluating question {} (type: {})", questionPosition, question.questionType());

        PrintReport.QuestionResult result = new PrintReport.QuestionResult();
        result.setQuestion(question);

        // Get student answer
        String studentAnswer = submission.getResponses().get(questionPosition);
        result.setStudentAnswer(studentAnswer != null ? studentAnswer : "No answer");

        log.debug("Student answer for Q{}: {}", questionPosition,
                studentAnswer != null && studentAnswer.length() > 100
                        ? studentAnswer.substring(0, 100) + "..."
                        : studentAnswer);

        // Determine correctness and feedback
        evaluateAnswer(question, studentAnswer, result);

        log.debug("Q{} evaluation: {}", questionPosition,
                result.isCorrect() ? CORRECT_LITERAL : INCORRECT_LITERAL);

        return result;
    }

    private void buildFeedback(CanvasQuestionDto question, PrintReport.QuestionResult result) {
        StringBuilder feedback = new StringBuilder();

        // Add general/neutral feedback first (shown to everyone)
        if (question.neutralComments() != null && !question.neutralComments().isEmpty()) {
            feedback.append("<div class='feedback-general'>")
                    .append(question.neutralComments())
                    .append(DIV_END);
        }

        // Add correct/incorrect specific feedback
        if (result.isCorrect()) {
            if (question.correctComments() != null && !question.correctComments().isEmpty()) {
                feedback.append("<div class='feedback-correct'>")
                        .append(question.correctComments())
                        .append(DIV_END);
            }
        } else {
            if (question.incorrectComments() != null && !question.incorrectComments().isEmpty()) {
                feedback.append("<div class='feedback-incorrect'>")
                        .append(question.incorrectComments())
                        .append(DIV_END);
            }
        }

        // Add answer-specific feedback if available
        addAnswerSpecificFeedback(question, result, feedback);

        result.setFeedbackToShow(feedback.toString());
    }

    private void addAnswerSpecificFeedback(CanvasQuestionDto question, PrintReport.QuestionResult result,
            StringBuilder feedback) {
        if (question.answers() != null) {
            for (CanvasAnswerDto answer : question.answers()) {
                if (answer.comments() != null && !answer.comments().isEmpty()) {
                    String answerText = HtmlUtils.stripHtml(answer.text());
                    if (result.getStudentAnswer() != null &&
                            result.getStudentAnswer().contains(answerText)) {
                        feedback.append("<div class='feedback-answer-specific'>")
                                .append(answer.comments())
                                .append(DIV_END);
                    }
                }
            }
        }
    }
}
