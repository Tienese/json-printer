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
        return "redirect:/print-report";
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

        log.info("=== Starting print report generation ===");
        log.info("Course ID: {}, Quiz ID: {}, CSV File: {} ({} bytes)",
                courseId, quizId, csvFile.getOriginalFilename(), csvFile.getSize());

        try {
            // Validate inputs
            log.debug("Validating input parameters");
            if (courseId == null || courseId.isBlank()) {
                log.warn("Course ID is missing or blank");
                redirectAttributes.addFlashAttribute("error", "Course ID is required");
                return "redirect:/print-report";
            }

            if (quizId == null || quizId.isBlank()) {
                log.warn("Quiz ID is missing or blank");
                redirectAttributes.addFlashAttribute("error", "Quiz ID is required");
                return "redirect:/print-report";
            }

            if (csvFile.isEmpty()) {
                log.warn("CSV file is empty");
                redirectAttributes.addFlashAttribute("error", "CSV file is required");
                return "redirect:/print-report";
            }

            log.info("Input validation passed");

            // Step 1: Fetch quiz from Canvas
            log.info("Step 1/4: Fetching quiz from Canvas...");
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            if (quiz == null) {
                log.error("Failed to fetch quiz from Canvas - quiz is null");
                redirectAttributes.addFlashAttribute("error", "Failed to fetch quiz from Canvas");
                return "redirect:/print-report";
            }
            log.info("Step 1/4: Successfully fetched quiz '{}'", quiz.title());

            // Step 2: Fetch questions
            log.info("Step 2/4: Fetching quiz questions...");
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            if (questions.isEmpty()) {
                log.error("No questions found for this quiz");
                redirectAttributes.addFlashAttribute("error", "No questions found for this quiz");
                return "redirect:/print-report";
            }
            log.info("Step 2/4: Successfully fetched {} questions", questions.size());

            // Step 3: Parse CSV submissions
            log.info("Step 3/4: Parsing CSV submissions...");
            List<StudentSubmission> submissions = csvParser.parseSubmissions(csvFile);
            if (submissions.isEmpty()) {
                log.error("No student submissions found in CSV");
                redirectAttributes.addFlashAttribute("error", "No student submissions found in CSV");
                return "redirect:/print-report";
            }
            log.info("Step 3/4: Successfully parsed {} student submissions", submissions.size());

            // Step 4: Generate report
            log.info("Step 4/4: Generating print report...");
            PrintReport report = reportGenerator.generateReport(quiz, questions, submissions);
            log.info("Step 4/4: Successfully generated report");

            // Step 5: Add to model and render
            log.info("Rendering report view");
            model.addAttribute("report", report);
            log.info("=== Print report generation completed successfully ===");
            return "print-report-view";

        } catch (Exception e) {
            log.error("=== Error generating print report ===", e);
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
            return "redirect:/print-report";
        }
    }
}
