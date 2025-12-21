package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.QuizPrintViewModel;
import com.qtihelper.demo.model.StudentSubmission;
import com.qtihelper.demo.service.CanvasQuizFetcher;
import com.qtihelper.demo.service.CsvSubmissionParser;
import com.qtihelper.demo.service.PrintReportGenerator;
import com.qtihelper.demo.service.QuizPrintViewModelMapper;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for handling print report generation from Canvas quiz data.
 *
 * Endpoints:
 * - POST /api/print-report/generate : Generate report from CSV + Canvas
 * - GET /api/print-report/blank-quiz : Generate blank quiz
 */
@RestController
@RequestMapping("/api/print-report")
public class PrintReportController {

    private static final Logger log = LoggerFactory.getLogger(PrintReportController.class);

    private final CanvasQuizFetcher canvasFetcher;
    private final CsvSubmissionParser csvParser;
    private final PrintReportGenerator reportGenerator;
    private final QuizPrintViewModelMapper viewModelMapper;

    public PrintReportController(CanvasQuizFetcher canvasFetcher,
            CsvSubmissionParser csvParser,
            PrintReportGenerator reportGenerator,
            QuizPrintViewModelMapper viewModelMapper) {
        this.canvasFetcher = canvasFetcher;
        this.csvParser = csvParser;
        this.reportGenerator = reportGenerator;
        this.viewModelMapper = viewModelMapper;
    }

    /**
     * Generate print report from Canvas quiz data and CSV submissions.
     */
    @PostMapping("/generate")
    public QuizPrintViewModel generateReport(@NotBlank @RequestParam("courseId") String courseId,
            @NotBlank @RequestParam("quizId") String quizId,
            @RequestParam("csvFile") MultipartFile csvFile,
            @RequestParam(value = "reportType", defaultValue = "slip") String reportType) {

        long startTime = System.currentTimeMillis();
        log.info("=== API: Starting print report generation ===");
        log.info("Course ID: {}, Quiz ID: {}, Report Type: {}", courseId, quizId, reportType);

        try {
            // Validate inputs
            if (courseId == null || courseId.isBlank()) {
                throw new IllegalArgumentException("Course ID is required");
            }
            if (quizId == null || quizId.isBlank()) {
                throw new IllegalArgumentException("Quiz ID is required");
            }
            if (csvFile == null || csvFile.isEmpty()) {
                throw new IllegalArgumentException("CSV file is required");
            }

            // Fetch quiz from Canvas
            log.info("Step 1/5: Fetching quiz from Canvas...");
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            if (quiz == null) {
                throw new RuntimeException("Failed to fetch quiz from Canvas");
            }
            log.info("Successfully fetched quiz: {}", quiz.title());

            // Fetch questions
            log.info("Step 2/5: Fetching quiz questions...");
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            if (questions.isEmpty()) {
                throw new RuntimeException("No questions found for this quiz");
            }
            log.info("Successfully fetched {} questions", questions.size());

            // Parse CSV
            log.info("Step 3/5: Parsing CSV file...");
            List<StudentSubmission> submissions = csvParser.parseSubmissions(csvFile);
            if (submissions.isEmpty()) {
                throw new RuntimeException("No student submissions found in CSV file");
            }
            log.info("Successfully parsed {} student submissions", submissions.size());

            // Generate report
            log.info("Step 4/5: Generating print report...");
            PrintReport report = reportGenerator.generateReport(quiz, questions, submissions, reportType);
            log.info("Successfully generated report");

            // Map to view model
            log.info("Step 5/5: Mapping to view model...");
            QuizPrintViewModel viewModel = viewModelMapper.mapToViewModel(quiz, questions, submissions, report);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("=== API: Report generation completed in {}ms ===", totalDuration);

            return viewModel;

        } catch (Exception e) {
            log.error("=== API: Error generating print report ===", e);
            throw new RuntimeException("Failed to generate report: " + e.getMessage());
        }
    }

    /**
     * Generate blank quiz worksheet.
     */
    @GetMapping("/blank-quiz")
    public QuizPrintViewModel generateBlankQuiz(@NotBlank @RequestParam("courseId") String courseId,
            @NotBlank @RequestParam("quizId") String quizId) {

        long startTime = System.currentTimeMillis();
        log.info("=== API: Starting blank quiz generation ===");
        log.info("Course ID: {}, Quiz ID: {}", courseId, quizId);

        try {
            // Validate inputs
            if (courseId == null || courseId.isBlank()) {
                throw new IllegalArgumentException("Course ID is required");
            }
            if (quizId == null || quizId.isBlank()) {
                throw new IllegalArgumentException("Quiz ID is required");
            }

            // Fetch quiz from Canvas
            log.info("Step 1/3: Fetching quiz from Canvas...");
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            if (quiz == null) {
                throw new RuntimeException("Failed to fetch quiz from Canvas");
            }
            log.info("Successfully fetched quiz: {}", quiz.title());

            // Fetch questions
            log.info("Step 2/3: Fetching quiz questions...");
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            if (questions.isEmpty()) {
                throw new RuntimeException("No questions found for this quiz");
            }
            log.info("Successfully fetched {} questions", questions.size());

            // Map to blank quiz view model
            log.info("Step 3/3: Mapping to blank quiz view model...");
            QuizPrintViewModel viewModel = viewModelMapper.mapToBlankQuizViewModel(quiz, questions);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("=== API: Blank quiz generation completed in {}ms ===", totalDuration);

            return viewModel;

        } catch (Exception e) {
            log.error("=== API: Error generating blank quiz ===", e);
            throw new RuntimeException("Failed to generate blank quiz: " + e.getMessage());
        }
    }
}