package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.quiz.QuizValidationResult;
import com.qtihelper.demo.dto.quiz.UserAnswer;
import com.qtihelper.demo.dto.quiz.UserQuestion;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service for parsing and validating user JSON quiz data.
 */
@Service
public class JsonQuizParserService {

    private static final Logger log = LoggerFactory.getLogger(JsonQuizParserService.class);
    private final ObjectMapper objectMapper;

    public JsonQuizParserService() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Parse JSON string into UserQuizJson object.
     *
     * @param jsonString JSON string containing quiz data
     * @return Parsed and validated UserQuizJson object
     * @throws IllegalArgumentException if JSON is invalid or validation fails
     */
    public UserQuizJson parseJsonString(String jsonString) {
        log.info("Parsing JSON string of length: {}", jsonString != null ? jsonString.length() : 0);

        if (jsonString == null || jsonString.isBlank()) {
            throw new IllegalArgumentException("JSON string cannot be empty");
        }

        try {
            UserQuizJson quiz = objectMapper.readValue(jsonString, UserQuizJson.class);
            log.info("Successfully parsed JSON into UserQuizJson: {}", quiz);

            // Validate
            validateQuiz(quiz);

            log.info("Quiz validation passed: {} questions", quiz.getQuestions().size());
            return quiz;

        } catch (IOException e) {
            log.error("Failed to parse JSON string", e);
            throw new IllegalArgumentException("Invalid JSON format: " + e.getMessage(), e);
        }
    }

    /**
     * Parse JSON file into UserQuizJson object.
     *
     * @param file Multipart file containing JSON quiz data
     * @return Parsed and validated UserQuizJson object
     * @throws IOException if file reading fails
     * @throws IllegalArgumentException if JSON is invalid or validation fails
     */
    public UserQuizJson parseJsonFile(MultipartFile file) throws IOException {
        log.info("Parsing JSON file: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".json")) {
            throw new IllegalArgumentException("File must be a JSON file (.json)");
        }

        try {
            UserQuizJson quiz = objectMapper.readValue(file.getInputStream(), UserQuizJson.class);
            log.info("Successfully parsed JSON file into UserQuizJson: {}", quiz);

            // Validate
            validateQuiz(quiz);

            log.info("Quiz validation passed: {} questions", quiz.getQuestions().size());
            return quiz;

        } catch (IOException e) {
            log.error("Failed to parse JSON file", e);
            throw new IOException("Failed to read JSON file: " + e.getMessage(), e);
        }
    }

    /**
     * Perform detailed validation of quiz structure and content.
     * Collects all errors and warnings instead of failing on first error.
     *
     * @param quiz UserQuizJson object to validate
     * @return QuizValidationResult containing errors and warnings
     */
    public QuizValidationResult validateQuizDetailed(UserQuizJson quiz) {
        QuizValidationResult result = QuizValidationResult.success();

        if (quiz == null) {
            result.addError("Quiz cannot be null");
            return result;
        }

        // 1. ERRORS - Title validation
        if (quiz.getTitle() == null || quiz.getTitle().isBlank()) {
            result.addError("Quiz title is required");
        }

        // WARNINGS - Description validation
        if (quiz.getDescription() == null || quiz.getDescription().isBlank()) {
            result.addWarning("Quiz description is missing");
        }

        // 2. ERRORS - Questions list validation
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            result.addError("Quiz must have at least one question");
            return result; // Can't validate questions if list is null/empty
        }

        // 3. Validate each question
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            UserQuestion question = quiz.getQuestions().get(i);
            int questionNumber = i + 1;

            // ERRORS - Prompt validation
            if (question.getPrompt() == null || question.getPrompt().isBlank()) {
                result.addError(String.format("Question %d: Prompt is required", questionNumber));
            }

            // ERRORS - Answers/Matching validation
            String type = question.getType() != null ? question.getType().toUpperCase() : "";
            boolean isMatching = "MT".equals(type);

            if (isMatching) {
                boolean hasMatchingData = (question.getMatches() != null && !question.getMatches().isEmpty()) ||
                                         (question.getMatchingPairs() != null && !question.getMatchingPairs().isEmpty()) ||
                                         (question.getLeftColumn() != null && !question.getLeftColumn().isEmpty() &&
                                          question.getRightColumn() != null && !question.getRightColumn().isEmpty());
                if (!hasMatchingData) {
                    result.addError(String.format("Question %d: Matching question must have matches or matching pairs", questionNumber));
                }
                // Skip answer validation for MT
            } else {
                if (question.getAnswers() == null || question.getAnswers().isEmpty()) {
                    result.addError(String.format("Question %d: Must have answer options", questionNumber));
                    continue; // Can't validate answers if list is null/empty
                }

                // ERRORS - Correct answer count validation
                long correctCount = question.getAnswers().stream()
                        .filter(a -> a.getCorrect() != null && a.getCorrect())
                        .count();

                if (correctCount == 0) {
                    result.addError(String.format("Question %d: No correct answer marked", questionNumber));
                } else if (correctCount > 1) {
                    // Only error for MC/TF types, MA expects multiple
                    if ("MC".equals(type) || "TF".equals(type)) {
                        result.addError(String.format("Question %d: Multiple correct answers (expected exactly 1 for %s type)",
                                                       questionNumber, type));
                    }
                }
            }

            // WARNINGS - General feedback validation
            if (question.getGeneralFeedback() == null || question.getGeneralFeedback().isBlank()) {
                result.addWarning(String.format("Question %d: General feedback is missing", questionNumber));
            }

            // Validate each answer
            for (int j = 0; j < question.getAnswers().size(); j++) {
                UserAnswer answer = question.getAnswers().get(j);
                int answerNumber = j + 1;

                // ERRORS - Answer text validation
                if (answer.getText() == null || answer.getText().isBlank()) {
                    result.addError(String.format("Question %d, Answer %d: Text is required",
                                                   questionNumber, answerNumber));
                }

                // WARNINGS - Answer feedback validation
                if (answer.getFeedback() == null || answer.getFeedback().isBlank()) {
                    result.addWarning(String.format("Question %d, Answer %d: Feedback is empty",
                                                     questionNumber, answerNumber));
                } else if (answer.getFeedback().length() < 10) {
                    result.addWarning(String.format("Question %d, Answer %d: Feedback is very short",
                                                     questionNumber, answerNumber));
                }
            }
        }

        log.debug("Detailed validation result: {}", result);
        return result;
    }

    /**
     * Validate quiz structure and content.
     * Throws exception on first validation failure.
     *
     * @param quiz UserQuizJson object to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateQuiz(UserQuizJson quiz) {
        QuizValidationResult result = validateQuizDetailed(quiz);

        if (!result.isValid()) {
            // Build error message with all errors
            String errorMessage = "Quiz validation failed: " + String.join(", ", result.getErrors());
            log.error("Validation errors: {}", errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }

        // Log warnings if present
        if (!result.getWarnings().isEmpty()) {
            log.warn("Validation warnings: {}", String.join(", ", result.getWarnings()));
        }

        log.debug("Quiz validation successful");
    }

    /**
     * Convert UserQuizJson object back to JSON string.
     *
     * @param quiz UserQuizJson object
     * @return JSON string representation
     * @throws IOException if serialization fails
     */
    public String toJsonString(UserQuizJson quiz) throws IOException {
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(quiz);
    }
}
