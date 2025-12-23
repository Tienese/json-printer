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
import com.qtihelper.demo.util.HtmlUtils;
import com.qtihelper.demo.util.QuizEvalUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service to map PrintReport data to QuizPrintViewModel for optimized template
 * rendering.
 *
 * This mapper transforms Canvas API data and student submissions into a
 * view-optimized structure
 * with pre-computed values like option letters, visual markers, and formatted
 * feedback.
 */
@Service
public class QuizPrintViewModelMapper {

    private static final Logger log = LoggerFactory.getLogger(QuizPrintViewModelMapper.class);

    /**
     * Cache for stripped HTML text to avoid redundant regex operations.
     */
    private record TextCache(
        Map<Long, String> questionTexts,
        Map<Long, String> answerTexts,
        Map<Long, String> answerComments
    ) {}

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

        // Pre-compute stripped HTML for all questions and answers
        TextCache cache = buildTextCache(questions);

        QuizPrintViewModel viewModel = new QuizPrintViewModel();
        viewModel.setQuizTitle(quiz.title());
        viewModel.setQuizId(quiz.id());
        viewModel.setStudentCount(submissions.size());

        // Map each student report
        for (PrintReport.StudentReport studentReport : report.getStudentReports()) {
            StudentQuizView studentView = mapStudent(studentReport, cache);
            viewModel.getStudents().add(studentView);
        }

        log.info("ViewModel mapping completed successfully");
        return viewModel;
    }

    private TextCache buildTextCache(List<CanvasQuestionDto> questions) {
        Map<Long, String> questionTexts = new HashMap<>();
        Map<Long, String> answerTexts = new HashMap<>();
        Map<Long, String> answerComments = new HashMap<>();

        for (CanvasQuestionDto question : questions) {
            if (question.id() != null) {
                questionTexts.put(question.id(), HtmlUtils.stripHtml(question.questionText()));
            }

            if (question.answers() != null) {
                for (CanvasAnswerDto answer : question.answers()) {
                    if (answer.id() != null) {
                        answerTexts.put(answer.id(), HtmlUtils.stripHtml(answer.text()));
                        if (answer.comments() != null) {
                            answerComments.put(answer.id(), HtmlUtils.stripHtml(answer.comments()));
                        }
                    }
                }
            }
        }

        return new TextCache(questionTexts, answerTexts, answerComments);
    }

    /**
     * Maps a single student's report to StudentQuizView.
     */
    private StudentQuizView mapStudent(PrintReport.StudentReport studentReport, TextCache cache) {
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
            QuestionView questionView = mapQuestion(result, questionNum, cache);
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
    private QuestionView mapQuestion(PrintReport.QuestionResult result, int questionNumber, TextCache cache) {
        CanvasQuestionDto question = result.getQuestion();

        log.debug("Mapping question {} (type: {})", questionNumber, question.questionType());

        QuestionView questionView = new QuestionView();
        questionView.setQuestionNumber(questionNumber);

        // Use cached question text if available
        String text = (question.id() != null && cache.questionTexts().containsKey(question.id()))
                ? cache.questionTexts().get(question.id())
                : HtmlUtils.stripHtml(question.questionText());
        questionView.setQuestionText(text);

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
            List<OptionView> options = mapOptions(question, result, cache);
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
    private List<OptionView> mapOptions(CanvasQuestionDto question, PrintReport.QuestionResult result, TextCache cache) {
        List<OptionView> options = new ArrayList<>();

        int index = 0;
        for (CanvasAnswerDto answer : question.answers()) {
            OptionView optionView = new OptionView();

            // Assign option letter (A, B, C, D, ...)
            optionView.setOptionLetter(String.valueOf((char) ('A' + index)));

            // Use cached option text if available
            String text = (answer.id() != null && cache.answerTexts().containsKey(answer.id()))
                    ? cache.answerTexts().get(answer.id())
                    : HtmlUtils.stripHtml(answer.text());
            optionView.setOptionText(text);

            // Determine if this option is correct
            optionView.setCorrect(answer.isCorrect());

            // Determine if student selected this option
            boolean isStudentAnswer = QuizEvalUtils.isStudentAnswerMatch(
                    answer, result.getStudentAnswer(), index, question.questionType());
            optionView.setStudentAnswer(isStudentAnswer);

            // Compute visual marker
            String marker = computeVisualMarker(optionView.isCorrect(), isStudentAnswer, result.isCorrect());
            optionView.setVisualMarker(marker);

            // Set comment text (use cached if available)
            String comments = null;
            if (answer.comments() != null) {
                comments = (answer.id() != null && cache.answerComments().containsKey(answer.id()))
                        ? cache.answerComments().get(answer.id())
                        : HtmlUtils.stripHtml(answer.comments());
            }
            optionView.setCommentText(comments);

            options.add(optionView);
            index++;
        }

        return options;
    }

    /**
     * Computes the visual marker for an option.
     *
     * Logic:
     * - ✓ : Correct answer AND student selected it
     * - ✗ : Incorrect answer AND student selected it
     * - ▲ : Correct answer NOT selected by student (only shown if question is
     * wrong)
     * - "" : No marker (correct answer not selected when question is correct, or
     * incorrect answer not selected)
     *
     * @param isCorrect         Is this option correct?
     * @param isStudentAnswer   Did student select this option?
     * @param isQuestionCorrect Did student get the question correct overall?
     * @return Visual marker string
     */
    @SuppressWarnings("java:S2589") // False positive - logic is correct for visual markers
    private String computeVisualMarker(boolean isCorrect, boolean isStudentAnswer, boolean isQuestionCorrect) {
        if (isCorrect && isStudentAnswer) {
            return "✓"; // Correct and selected
        } else if (!isCorrect && isStudentAnswer) {
            return "✗"; // Incorrect and selected
        } else if (isCorrect && !isStudentAnswer && !isQuestionCorrect) {
            return "▲"; // Correct but not selected (show only when question is wrong)
        } else {
            return ""; // No marker
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
     * Maps Canvas quiz data to a blank quiz view model (no student answers).
     * Creates a single "student" with empty name/ID for worksheet header.
     *
     * @param quiz      Quiz metadata from Canvas
     * @param questions List of questions from Canvas
     * @return QuizPrintViewModel configured for blank quiz rendering
     */
    public QuizPrintViewModel mapToBlankQuizViewModel(CanvasQuizDto quiz,
            List<CanvasQuestionDto> questions) {
        log.info("Mapping to blank quiz view model for quiz: {}", quiz.title());

        // Sort questions by position
        List<CanvasQuestionDto> sortedQuestions = questions.stream()
                .sorted(Comparator.comparing(q -> q.position() != null ? q.position() : 0))
                .toList();

        // Map questions (no student answers, all unselected)
        List<QuestionView> questionViews = new ArrayList<>();
        int questionNumber = 1;
        for (CanvasQuestionDto question : sortedQuestions) {
            QuestionView questionView = mapQuestionToBlankView(question, questionNumber);
            questionViews.add(questionView);
            questionNumber++;
        }

        // Create single "student" with empty fields
        StudentQuizView studentView = new StudentQuizView();
        studentView.setStudentName(""); // Empty student name (will be filled in by hand)
        studentView.setStudentId(""); // Empty student ID
        studentView.setQuestions(questionViews);
        studentView.setIncorrectQuestionNumbers(List.of()); // No incorrect questions

        QuizPrintViewModel viewModel = new QuizPrintViewModel();
        viewModel.setQuizTitle(quiz.title());
        viewModel.setQuizId(quiz.id());
        viewModel.setStudentCount(1); // Single worksheet
        viewModel.setStudents(List.of(studentView));

        log.info("Successfully mapped blank quiz with {} questions", questionViews.size());
        return viewModel;
    }

    /**
     * Maps a single question to blank view (no answers selected).
     *
     * @param question       Canvas question DTO
     * @param questionNumber Question number (1-based)
     * @return QuestionView with empty answers
     */
    private QuestionView mapQuestionToBlankView(CanvasQuestionDto question, int questionNumber) {
        QuestionView questionView = new QuestionView();
        questionView.setQuestionNumber(questionNumber);
        questionView.setQuestionText(HtmlUtils.stripHtml(question.questionText()));
        questionView.setPointsPossible(question.pointsPossible() != null ? question.pointsPossible() : 1.0);
        questionView.setQuestionType(question.questionType());
        questionView.setStudentAnswerText(""); // No student answer
        questionView.setCorrect(false); // Not correct (no evaluation)
        questionView.setAnswerStatus(AnswerStatus.UNANSWERED);
        questionView.setFeedbackText(""); // No feedback

        // Map options if they exist
        if (question.answers() != null && !question.answers().isEmpty()) {
            questionView.setHasOptions(true);
            List<OptionView> options = new ArrayList<>();
            int index = 0;
            for (CanvasAnswerDto answer : question.answers()) {
                OptionView optionView = mapAnswerToBlankOption(answer, index);
                options.add(optionView);
                index++;
            }
            questionView.setOptions(options);
        } else {
            questionView.setHasOptions(false);
        }

        return questionView;
    }

    /**
     * Maps answer to blank option (unselected).
     *
     * @param answer Canvas answer DTO
     * @param index  Option index for letter assignment
     * @return OptionView with blank state
     */
    private OptionView mapAnswerToBlankOption(CanvasAnswerDto answer, int index) {
        OptionView optionView = new OptionView();
        optionView.setOptionLetter(String.valueOf((char) ('A' + index))); // A, B, C, D...
        optionView.setOptionText(HtmlUtils.stripHtml(answer.text() != null ? answer.text() : ""));
        optionView.setCorrect(false); // Not correct in blank mode
        optionView.setStudentAnswer(false); // Not selected
        optionView.setVisualMarker(""); // No visual marker
        optionView.setCommentText(""); // No comment

        return optionView;
    }
}
