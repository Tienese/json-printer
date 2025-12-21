package com.qtihelper.demo.util;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility class for quiz answer evaluation logic.
 * Consolidates duplicate answer matching logic from PrintReportGenerator and
 * QuizPrintViewModelMapper.
 */
public final class QuizEvalUtils {

    private static final Logger log = LoggerFactory.getLogger(QuizEvalUtils.class);
    private static final String CORRECT_LITERAL = "correct";
    private static final String INCORRECT_LITERAL = "incorrect";

    private QuizEvalUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Matches student answer by letter (A, B, C, D) to answer index.
     *
     * @param studentAnswer Student's answer (e.g., "A", "B")
     * @param answers       List of possible answers
     * @return true if the selected answer is correct
     */
    public static boolean matchByLetter(String studentAnswer, List<CanvasAnswerDto> answers) {
        int index = studentAnswer.charAt(0) - 'A';
        log.debug("Matching by letter: {} -> index {}", studentAnswer, index);
        if (index >= 0 && index < answers.size()) {
            CanvasAnswerDto selectedAnswer = answers.get(index);
            boolean isCorrect = selectedAnswer.isCorrect();
            if (log.isDebugEnabled()) {
                log.debug("Selected answer '{}' is {}", HtmlUtils.stripHtml(selectedAnswer.text()),
                        isCorrect ? CORRECT_LITERAL : INCORRECT_LITERAL);
            }
            return isCorrect;
        }
        return false;
    }

    /**
     * Matches student answer by text comparison.
     *
     * @param studentAnswer Student's answer text
     * @param correctTexts  List of correct answer texts
     * @return true if student answer matches any correct text (case-insensitive)
     */
    public static boolean matchByText(String studentAnswer, List<String> correctTexts) {
        log.debug("Matching by text: '{}'", studentAnswer);
        return correctTexts.stream()
                .anyMatch(ct -> ct.equalsIgnoreCase(studentAnswer.trim()));
    }

    /**
     * Parses multiple answers from a comma/semicolon-separated string.
     *
     * @param studentAnswer Student's answer string (e.g., "A,B,C" or "A;B;C")
     * @param answers       List of possible answers (for letter-to-text conversion)
     * @return List of answer texts
     */
    public static List<String> parseMultipleAnswers(String studentAnswer, List<CanvasAnswerDto> answers) {
        String[] studentAnswers = studentAnswer.split("[,;]");
        log.debug("Parsing {} student answers from: '{}'", studentAnswers.length, studentAnswer);

        List<String> studentList = new ArrayList<>();
        for (String ans : studentAnswers) {
            String trimmed = ans.trim();
            if (!trimmed.isEmpty()) {
                studentList.add(convertAnswerToText(trimmed, answers));
            }
        }
        log.debug("Student selected {} answers: {}", studentList.size(), studentList);
        return studentList;
    }

    /**
     * Determines if a student selected a specific answer option.
     * Handles multiple question types and matching strategies.
     *
     * @param answer        The answer option
     * @param studentAnswer The student's answer string
     * @param index         The index of this answer (for letter matching)
     * @param questionType  The type of question
     * @return true if student selected this option
     */
    public static boolean isStudentAnswerMatch(CanvasAnswerDto answer,
            String studentAnswer,
            int index,
            String questionType) {
        if (studentAnswer == null || studentAnswer.isEmpty() || "No answer".equals(studentAnswer)) {
            return false;
        }

        String optionText = HtmlUtils.stripHtml(answer.text());

        // Handle different question types
        return switch (questionType) {
            case "multiple_choice_question", "true_false_question" -> {
                // Try matching by letter first (A, B, C, D)
                if (studentAnswer.length() == 1 && Character.isUpperCase(studentAnswer.charAt(0))) {
                    char expectedLetter = (char) ('A' + index);
                    yield studentAnswer.charAt(0) == expectedLetter;
                }
                // Try matching by text
                yield optionText.equalsIgnoreCase(studentAnswer.trim());
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
                            yield true;
                        }
                    }
                    // Match by text
                    if (optionText.equalsIgnoreCase(trimmed)) {
                        yield true;
                    }
                }
                yield false;
            }
            case "multiple_dropdowns_question", "matching_question" ->
                // Check if answer text is contained in student response
                studentAnswer.contains(optionText);
            default ->
                // Default: simple text matching
                optionText.equalsIgnoreCase(studentAnswer.trim());
        };
    }

    /**
     * Converts answer letter to text or returns text as-is.
     * Helper method for parseMultipleAnswers.
     *
     * @param answer  Answer string (letter or text)
     * @param answers List of possible answers
     * @return Answer text
     */
    private static String convertAnswerToText(String answer, List<CanvasAnswerDto> answers) {
        // If it's a single letter, convert to text
        if (answer.length() == 1 && Character.isUpperCase(answer.charAt(0))) {
            int index = answer.charAt(0) - 'A';
            if (index >= 0 && index < answers.size()) {
                return HtmlUtils.stripHtml(answers.get(index).text());
            }
        }
        return answer;
    }
}
