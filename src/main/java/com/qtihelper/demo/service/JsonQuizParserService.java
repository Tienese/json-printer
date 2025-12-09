package com.qtihelper.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
     * Validate quiz structure and content.
     *
     * @param quiz UserQuizJson object to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateQuiz(UserQuizJson quiz) {
        if (quiz == null) {
            throw new IllegalArgumentException("Quiz cannot be null");
        }

        if (!quiz.isValid()) {
            throw new IllegalArgumentException("Quiz validation failed: Check title and questions");
        }

        // Additional validation
        if (quiz.getTitle() == null || quiz.getTitle().isBlank()) {
            throw new IllegalArgumentException("Quiz title is required");
        }

        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new IllegalArgumentException("Quiz must have at least one question");
        }

        // Validate each question
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            var question = quiz.getQuestions().get(i);
            if (!question.isValid()) {
                throw new IllegalArgumentException(
                    String.format("Question #%d validation failed: %s", i + 1, question));
            }

            // Check points
            if (question.getPoints() == null || question.getPoints() <= 0) {
                throw new IllegalArgumentException(
                    String.format("Question #%d must have points > 0", i + 1));
            }

            // Check type
            String type = question.getType().toUpperCase();
            if (!java.util.List.of("MC", "MA", "MD", "MT", "TF", "DD").contains(type)) {
                throw new IllegalArgumentException(
                    String.format("Question #%d has unsupported type: %s", i + 1, type));
            }
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
