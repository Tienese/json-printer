package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.AnswerStatus;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.QuizPrintViewModel;
import com.qtihelper.demo.model.QuizPrintViewModel.OptionView;
import com.qtihelper.demo.model.QuizPrintViewModel.QuestionView;
import com.qtihelper.demo.model.QuizPrintViewModel.StudentQuizView;
import com.qtihelper.demo.model.StudentSubmission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service to map PrintReport data to QuizPrintViewModel for optimized template rendering.
 *
 * This mapper transforms Canvas API data and student submissions into a view-optimized structure
 * with pre-computed values like option letters, visual markers, and formatted feedback.
 */
@Service
public class QuizPrintViewModelMapper {

    private static final Logger log = LoggerFactory.getLogger(QuizPrintViewModelMapper.class);

    /**
     * Maps PrintReport and Canvas data to QuizPrintViewModel.
     *
     * @param quiz        Canvas quiz metadata
     * @param questions   Canvas quiz questions
     * @param submissions Student submissions from CSV
     * @param report      Generated print report
     * @return View-optimized model for template rendering
     */
    public QuizPrintViewModel mapToViewModel(CanvasQuizDto quiz,
                                              List<CanvasQuestionDto> questions,
                                              List<StudentSubmission> submissions,
                                              PrintReport report) {

        log.info("Starting ViewModel mapping for quiz: {}", quiz.title());
        log.debug("Mapping {} students with {} questions", submissions.size(), questions.size());

        QuizPrintViewModel viewModel = new QuizPrintViewModel();
        viewModel.setQuizTitle(quiz.title());
        viewModel.setStudentCount(submissions.size());

        // Map each student report
        for (PrintReport.StudentReport studentReport : report.getStudentReports()) {
            StudentQuizView studentView = mapStudent(studentReport);
            viewModel.getStudents().add(studentView);
        }

        log.info("ViewModel mapping completed successfully");
        return viewModel;
    }

    /**
     * Maps a single student's report to StudentQuizView.
     */
    private StudentQuizView mapStudent(PrintReport.StudentReport studentReport) {
        StudentSubmission student = studentReport.getStudent();
        log.debug("Mapping student: {} {} (ID: {})",
                student.getFirstName(), student.getLastName(), student.getStudentId());

        StudentQuizView studentView = new StudentQuizView();
        studentView.setStudentName(student.getFullName());
        studentView.setStudentId(student.getStudentId());

        List<Integer> incorrectNumbers = new ArrayList<>();

        // Map each question result
        int questionNum = 1;
        for (PrintReport.QuestionResult result : studentReport.getQuestionResults()) {
            QuestionView questionView = mapQuestion(result, questionNum);
            studentView.getQuestions().add(questionView);

            // Collect incorrect or unanswered question numbers
            if (questionView.getAnswerStatus() == AnswerStatus.INCORRECT ||
                    questionView.getAnswerStatus() == AnswerStatus.UNANSWERED) {
                incorrectNumbers.add(questionNum);
            }

            questionNum++;
        }

        studentView.setIncorrectQuestionNumbers(incorrectNumbers);
        log.debug("Mapped {} questions for student {} ({} incorrect/unanswered)",
                studentView.getQuestions().size(), student.getStudentId(), incorrectNumbers.size());
        return studentView;
    }

    /**
     * Maps a single question result to QuestionView.
     */
    private QuestionView mapQuestion(PrintReport.QuestionResult result, int questionNumber) {
        CanvasQuestionDto question = result.getQuestion();

        log.debug("Mapping question {} (type: {})", questionNumber, question.questionType());

        QuestionView questionView = new QuestionView();
        questionView.setQuestionNumber(questionNumber);
        questionView.setQuestionText(stripHtml(question.questionText()));
        questionView.setPointsPossible(question.pointsPossible() != null ? question.pointsPossible() : 0.0);
        questionView.setQuestionType(question.questionType());

        String studentAnswer = result.getStudentAnswer();
        questionView.setStudentAnswerText(studentAnswer != null ? studentAnswer : "No answer");
        questionView.setCorrect(result.isCorrect());

        // Determine answer status (tri-state: CORRECT, INCORRECT, UNANSWERED)
        AnswerStatus status = determineAnswerStatus(studentAnswer, result.isCorrect());
        questionView.setAnswerStatus(status);
        log.debug("Question {} status: {}", questionNumber, status);

        questionView.setFeedbackText(result.getFeedbackToShow());

        // Map answer options if they exist
        if (question.answers() != null && !question.answers().isEmpty()) {
            questionView.setHasOptions(true);
            List<OptionView> options = mapOptions(question, result);
            questionView.setOptions(options);
            log.debug("Question {} has {} options", questionNumber, options.size());
        } else {
            questionView.setHasOptions(false);
            log.debug("Question {} has no options (essay or other type)", questionNumber);
        }

        return questionView;
    }

    /**
     * Maps answer options to OptionView list with visual markers.
     */
    private List<OptionView> mapOptions(CanvasQuestionDto question, PrintReport.QuestionResult result) {
        List<OptionView> options = new ArrayList<>();

        int index = 0;
        for (CanvasAnswerDto answer : question.answers()) {
            OptionView optionView = new OptionView();

            // Assign option letter (A, B, C, D, ...)
            optionView.setOptionLetter(String.valueOf((char) ('A' + index)));

            // Strip HTML from option text
            optionView.setOptionText(stripHtml(answer.text()));

            // Determine if this option is correct
            optionView.setCorrect(answer.isCorrect());

            // Determine if student selected this option
            boolean isStudentAnswer = isStudentAnswerMatch(answer, result.getStudentAnswer(), index, question);
            optionView.setStudentAnswer(isStudentAnswer);

            // Compute visual marker
            String marker = computeVisualMarker(optionView.isCorrect(), isStudentAnswer, result.isCorrect());
            optionView.setVisualMarker(marker);

            // Set comment text (strip HTML if present)
            optionView.setCommentText(answer.comments() != null ? stripHtml(answer.comments()) : null);

            options.add(optionView);
            index++;
        }

        return options;
    }

    /**
     * Determines if the student selected this answer option.
     *
     * @param answer        The Canvas answer DTO
     * @param studentAnswer The student's answer string from CSV
     * @param index         The index of this answer (for letter matching)
     * @param question      The question DTO
     * @return true if student selected this option
     */
    private boolean isStudentAnswerMatch(CanvasAnswerDto answer,
                                          String studentAnswer,
                                          int index,
                                          CanvasQuestionDto question) {

        if (studentAnswer == null || studentAnswer.isEmpty() || "No answer".equals(studentAnswer)) {
            return false;
        }

        String questionType = question.questionType();
        String optionText = stripHtml(answer.text());

        // Handle different question types
        switch (questionType) {
            case "multiple_choice_question", "true_false_question" -> {
                // Try matching by letter first (A, B, C, D)
                if (studentAnswer.length() == 1 && Character.isUpperCase(studentAnswer.charAt(0))) {
                    char expectedLetter = (char) ('A' + index);
                    return studentAnswer.charAt(0) == expectedLetter;
                }
                // Try matching by text
                return optionText.equalsIgnoreCase(studentAnswer.trim());
            }
            case "multiple_answers_question" -> {
                // Split by comma or semicolon
                String[] studentAnswers = studentAnswer.split("[,;]");
                for (String ans : studentAnswers) {
                    String trimmed = ans.trim();
                    // Match by letter
                    if (trimmed.length() == 1 && Character.isUpperCase(trimmed.charAt(0))) {
                        char expectedLetter = (char) ('A' + index);
                        if (trimmed.charAt(0) == expectedLetter) {
                            return true;
                        }
                    }
                    // Match by text
                    if (optionText.equalsIgnoreCase(trimmed)) {
                        return true;
                    }
                }
                return false;
            }
            case "multiple_dropdowns_question" -> {
                // Check if answer text is contained in student response
                return studentAnswer.contains(optionText);
            }
            case "matching_question" -> {
                // Check if answer text is contained in student response
                return studentAnswer.contains(optionText);
            }
            default -> {
                // Default: simple text matching
                return optionText.equalsIgnoreCase(studentAnswer.trim());
            }
        }
    }

    /**
     * Computes the visual marker for an option.
     *
     * Logic:
     * - ✓ : Correct answer AND student selected it
     * - ✗ : Incorrect answer AND student selected it
     * - ▲ : Correct answer NOT selected by student (only shown if question is wrong)
     * - "" : No marker (correct answer not selected when question is correct, or incorrect answer not selected)
     *
     * @param isCorrect         Is this option correct?
     * @param isStudentAnswer   Did student select this option?
     * @param isQuestionCorrect Did student get the question correct overall?
     * @return Visual marker string
     */
    private String computeVisualMarker(boolean isCorrect, boolean isStudentAnswer, boolean isQuestionCorrect) {
        if (isCorrect && isStudentAnswer) {
            return "✓";  // Correct and selected
        } else if (!isCorrect && isStudentAnswer) {
            return "✗";  // Incorrect and selected
        } else if (isCorrect && !isStudentAnswer && !isQuestionCorrect) {
            return "▲";  // Correct but not selected (show only when question is wrong)
        } else {
            return "";   // No marker
        }
    }

    /**
     * Determines the answer status based on student response and correctness.
     *
     * @param studentAnswer Student's answer string (can be null/empty)
     * @param isCorrect     Whether the answer was evaluated as correct
     * @return AnswerStatus enum value
     */
    private AnswerStatus determineAnswerStatus(String studentAnswer, boolean isCorrect) {
        // Check if unanswered (null, empty, or "No answer" placeholder)
        if (studentAnswer == null || studentAnswer.isEmpty() || "No answer".equals(studentAnswer)) {
            return AnswerStatus.UNANSWERED;
        }

        // If answered, return CORRECT or INCORRECT based on evaluation
        return isCorrect ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT;
    }

    /**
     * Strips HTML tags from text.
     *
     * @param text HTML text
     * @return Plain text without HTML tags
     */
    private String stripHtml(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("<[^>]*>", "").trim();
    }
}
