package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.StudentSubmission;
import com.qtihelper.demo.service.CanvasQuizFetcher;
import com.qtihelper.demo.service.CsvSubmissionParser;
import com.qtihelper.demo.service.PrintReportGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class PrintReportController {

    private static final Logger log = LoggerFactory.getLogger(PrintReportController.class);
    private static final String REDIRECT_PRINT_REPORT = "redirect:/print-report";
    private static final String ERROR_ATTRIBUTE = "error";
    private static final String ERROR_MESSAGE_LOG = "Error message: {}";

    private final CanvasQuizFetcher canvasFetcher;
    private final CsvSubmissionParser csvParser;
    private final PrintReportGenerator reportGenerator;
    
    public PrintReportController(CanvasQuizFetcher canvasFetcher,
                                CsvSubmissionParser csvParser,
                                PrintReportGenerator reportGenerator) {
        this.canvasFetcher = canvasFetcher;
        this.csvParser = csvParser;
        this.reportGenerator = reportGenerator;
    }

    @GetMapping("/")
    public String home() {
        return REDIRECT_PRINT_REPORT;
    }

    @GetMapping("/print-report")
    public String showUploadForm() {
        return "print-report-upload";
    }
    
    @PostMapping("/print-report/generate")
    public String generateReport(@RequestParam("courseId") String courseId,
                                @RequestParam("quizId") String quizId,
                                @RequestParam("csvFile") MultipartFile csvFile,
                                Model model,
                                RedirectAttributes redirectAttributes) {

        long startTime = System.currentTimeMillis();
        log.info("=== Starting print report generation ===");
        log.info("Course ID: {}, Quiz ID: {}, CSV File: {} ({} bytes)",
                courseId, quizId, csvFile.getOriginalFilename(), csvFile.getSize());

        try {
            // Validate inputs
            log.debug("Validating input parameters");
            if (courseId == null || courseId.isBlank()) {
                log.warn("Course ID is missing or blank");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Course ID is required");
                return REDIRECT_PRINT_REPORT;
            }

            if (quizId == null || quizId.isBlank()) {
                log.warn("Quiz ID is missing or blank");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Quiz ID is required");
                return REDIRECT_PRINT_REPORT;
            }

            if (csvFile.isEmpty()) {
                log.warn("CSV file is empty");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "CSV file is required");
                return REDIRECT_PRINT_REPORT;
            }

            // Validate file type
            String contentType = csvFile.getContentType();
            String filename = csvFile.getOriginalFilename();
            log.debug("File content type: {}, filename: {}", contentType, filename);

            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                log.warn("Invalid file type: {}", filename);
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE,
                    "Invalid file type. Please upload a CSV file (.csv)");
                return REDIRECT_PRINT_REPORT;
            }

            log.info("Input validation passed");

            // Step 1: Fetch quiz from Canvas
            log.info("Step 1/4: Fetching quiz from Canvas...");
            long step1Start = System.currentTimeMillis();
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            long step1Duration = System.currentTimeMillis() - step1Start;
            if (quiz == null) {
                log.error("Failed to fetch quiz from Canvas - quiz is null");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Failed to fetch quiz from Canvas");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 1/4: Successfully fetched quiz '{}' in {}ms", quiz.title(), step1Duration);

            // Step 2: Fetch questions
            log.info("Step 2/4: Fetching quiz questions...");
            long step2Start = System.currentTimeMillis();
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            long step2Duration = System.currentTimeMillis() - step2Start;
            if (questions.isEmpty()) {
                log.error("No questions found for this quiz");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "No questions found for this quiz");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 2/4: Successfully fetched {} questions in {}ms", questions.size(), step2Duration);

            // Step 3: Parse CSV submissions
            log.info("Step 3/4: Parsing CSV submissions...");
            long step3Start = System.currentTimeMillis();
            List<StudentSubmission> submissions = csvParser.parseSubmissions(csvFile);
            long step3Duration = System.currentTimeMillis() - step3Start;
            if (submissions.isEmpty()) {
                log.error("No student submissions found in CSV");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "No student submissions found in CSV");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 3/4: Successfully parsed {} student submissions in {}ms",
                    submissions.size(), step3Duration);

            // Step 4: Generate report
            log.info("Step 4/4: Generating print report...");
            long step4Start = System.currentTimeMillis();
            PrintReport report = reportGenerator.generateReport(quiz, questions, submissions);
            long step4Duration = System.currentTimeMillis() - step4Start;
            log.info("Step 4/4: Successfully generated report in {}ms", step4Duration);

            // Step 5: Add to model and render
            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("Rendering report view");
            model.addAttribute("report", report);
            log.info("=== Print report generation completed successfully in {}ms ===", totalDuration);
            log.info("Performance breakdown: Quiz={}ms, Questions={}ms, CSV={}ms, Report={}ms",
                    step1Duration, step2Duration, step3Duration, step4Duration);
            return "print-report-view";

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("=== Canvas API error (HTTP {}) ===", e.getStatusCode(), e);
            log.error(ERROR_MESSAGE_LOG, e.getMessage());
            String userMessage = switch (e.getStatusCode().value()) {
                case 401 -> "Invalid Canvas API token. Please check your configuration.";
                case 403 -> "Access denied. Your Canvas API token doesn't have permission to access this quiz.";
                case 404 -> "Quiz not found. Please verify the Course ID and Quiz ID are correct.";
                case 429 -> "Canvas API rate limit exceeded. Please try again in a few moments.";
                default -> "Canvas API error: " + e.getMessage();
            };
            redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, userMessage);
            return REDIRECT_PRINT_REPORT;
        } catch (java.io.IOException e) {
            log.error("=== CSV file reading error ===", e);
            log.error(ERROR_MESSAGE_LOG, e.getMessage());
            redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE,
                "Failed to read CSV file. Please ensure the file is not corrupted and try again.");
            return REDIRECT_PRINT_REPORT;
        } catch (IllegalArgumentException e) {
            log.error("=== Invalid data error ===", e);
            log.error(ERROR_MESSAGE_LOG, e.getMessage());
            redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE,
                "Invalid data in CSV or quiz. Please verify your file format: " + e.getMessage());
            return REDIRECT_PRINT_REPORT;
        } catch (Exception e) {
            log.error("=== Unexpected error generating print report ===", e);
            log.error("Error type: {}", e.getClass().getName());
            log.error(ERROR_MESSAGE_LOG, e.getMessage());
            log.error("Stack trace:", e);
            redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE,
                "An unexpected error occurred. Please check the logs for details or contact support.");
            return REDIRECT_PRINT_REPORT;
        }
    }
}
