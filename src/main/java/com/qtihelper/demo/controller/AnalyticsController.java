package com.qtihelper.demo.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.QuizStatistics;
import com.qtihelper.demo.model.StudentSubmission;
import com.qtihelper.demo.service.CanvasQuizFetcher;
import com.qtihelper.demo.service.StatisticsService;
import com.qtihelper.demo.service.StudentSubmissionParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * REST controller for quiz analytics endpoints.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final StatisticsService statisticsService;
    private final CanvasQuizFetcher quizFetcher;
    private final StudentSubmissionParser submissionParser;
    private final ObjectMapper objectMapper;

    public AnalyticsController(
            StatisticsService statisticsService,
            CanvasQuizFetcher quizFetcher,
            StudentSubmissionParser submissionParser,
            ObjectMapper objectMapper) {
        this.statisticsService = statisticsService;
        this.quizFetcher = quizFetcher;
        this.submissionParser = submissionParser;
        this.objectMapper = objectMapper;
    }

    /**
     * Compute quiz statistics from uploaded CSV.
     * Supports both online (Canvas API) and offline (local JSON) modes.
     * 
     * POST /api/analytics/statistics
     */
    @PostMapping("/statistics")
    public ResponseEntity<QuizStatistics> computeStatistics(
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "quizId", required = false) Long quizId,
            @RequestParam("file") MultipartFile csvFile,
            @RequestParam(value = "quizFile", required = false) MultipartFile quizFile) {

        log.info("Computing statistics with CSV file");

        try {
            CanvasQuizDto quiz;
            List<CanvasQuestionDto> questions;

            // OFFLINE MODE: Use uploaded quiz JSON
            if (quizFile != null && !quizFile.isEmpty()) {
                log.info("OFFLINE MODE: Using uploaded quiz metadata");
                quiz = parseQuizJson(quizFile);
                questions = parseQuestionsJson(quizFile);
            }
            // ONLINE MODE: Fetch from Canvas API
            else if (courseId != null && quizId != null) {
                log.info("ONLINE MODE: Fetching from Canvas API");
                quiz = quizFetcher.getQuiz(courseId, String.valueOf(quizId));
                questions = quizFetcher.getQuizQuestions(courseId, String.valueOf(quizId));
            } else {
                log.warn("Missing required parameters for statistics computation");
                return ResponseEntity.badRequest().build();
            }

            // Parse CSV submissions
            List<StudentSubmission> submissions = submissionParser.parseSubmissions(
                    csvFile.getInputStream(), questions);

            // Compute statistics
            QuizStatistics statistics = statisticsService.computeStatistics(quiz, questions, submissions);

            log.info("Successfully computed statistics for {} students", submissions.size());
            return ResponseEntity.ok(statistics);

        } catch (Exception e) {
            log.error("Failed to compute statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Parse quiz metadata from uploaded JSON file.
     * 
     * Expected JSON format:
     * {
     * "quiz": { "id": 123, "title": "Quiz Name", ... },
     * "questions": [ { "id": 1, "question_text": "...", ... }, ... ]
     * }
     */
    private CanvasQuizDto parseQuizJson(MultipartFile quizFile) throws IOException {
        JsonNode root = objectMapper.readTree(quizFile.getInputStream());

        // Check for nested "quiz" object or direct quiz fields
        JsonNode quizNode = root.has("quiz") ? root.get("quiz") : root;

        return objectMapper.treeToValue(quizNode, CanvasQuizDto.class);
    }

    /**
     * Parse quiz questions from uploaded JSON file.
     */
    private List<CanvasQuestionDto> parseQuestionsJson(MultipartFile quizFile) throws IOException {
        JsonNode root = objectMapper.readTree(quizFile.getInputStream());

        // Check for nested "questions" array
        JsonNode questionsNode = root.has("questions") ? root.get("questions") : root;

        if (!questionsNode.isArray()) {
            throw new IllegalArgumentException("Expected 'questions' to be an array");
        }

        return objectMapper.readValue(
                questionsNode.traverse(),
                new TypeReference<List<CanvasQuestionDto>>() {
                });
    }

    /**
     * Get cached statistics (if previously computed).
     */
    @GetMapping("/quiz/{quizId}/statistics")
    public ResponseEntity<QuizStatistics> getStatistics(@PathVariable Long quizId) {
        log.warn("Statistics caching not yet implemented");
        return ResponseEntity.notFound().build();
    }
}
