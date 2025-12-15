package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.PrintReportEditDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.PrintReport;
import com.qtihelper.demo.model.QuizPrintViewModel;
import com.qtihelper.demo.model.StudentSubmission;
import com.qtihelper.demo.service.CanvasQuizFetcher;
import com.qtihelper.demo.service.CsvSubmissionParser;
import com.qtihelper.demo.service.PrintReportGenerator;
import com.qtihelper.demo.service.QuizPrintViewModelMapper;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for handling print report generation from Canvas quiz data.
 *
 * Endpoints:
 * - GET / : Landing page with feature links
 * - GET /print-report : Upload form for print report generation
 * - POST /print-report/generate : Process form and generate report
 */
@Controller
public class PrintReportController {

    private static final Logger log = LoggerFactory.getLogger(PrintReportController.class);
    private static final String REDIRECT_PRINT_REPORT = "redirect:/print-report";
    private static final String ERROR_ATTRIBUTE = "error";
    private static final String ERROR_MESSAGE_LOG = "Error message: {}";

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
     * Landing page - redirects to dashboard.
     */
    @GetMapping("/")
    public String home() {
        log.info("Root path accessed, redirecting to dashboard");
        return "redirect:/dashboard";
    }

    /**
     * Print report upload form.
     * Accepts optional parameters to pre-fill course/quiz IDs from dashboard.
     *
     * @param reportType "full" for full report, "slip" for retake slip (default)
     * @param courseId   Optional pre-filled course ID
     * @param quizId     Optional pre-filled quiz ID
     * @param quizTitle  Optional quiz title for display
     */
    @GetMapping("/print-report")
    public String showUploadForm(@RequestParam(value = "type", required = false) String reportType,
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "quizId", required = false) String quizId,
            @RequestParam(value = "quizTitle", required = false) String quizTitle,
            Model model) {
        log.info("Print report upload form accessed with type: {}, courseId: {}, quizId: {}",
                reportType, courseId, quizId);

        // Set default report type to slip if not specified
        if (reportType == null || reportType.isBlank()) {
            reportType = "slip";
        }

        // Validate report type
        if (!"full".equals(reportType) && !"slip".equals(reportType)) {
            log.warn("Invalid report type: {}, defaulting to slip", reportType);
            reportType = "slip";
        }

        model.addAttribute("reportType", reportType);
        model.addAttribute("reportTitle", "full".equals(reportType) ? "Full Print Report" : "Retake Slip Report");

        // Pre-fill form if IDs provided from dashboard
        if (courseId != null && !courseId.isBlank()) {
            model.addAttribute("prefilledCourseId", courseId);
        }
        if (quizId != null && !quizId.isBlank()) {
            model.addAttribute("prefilledQuizId", quizId);
        }
        if (quizTitle != null && !quizTitle.isBlank()) {
            model.addAttribute("quizTitle", quizTitle);
        }

        return "print-report-upload";
    }

    /**
     * Generate blank quiz worksheet for printing.
     * No CSV upload required - uses Canvas quiz data only.
     *
     * @param courseId Canvas course ID
     * @param quizId   Canvas quiz ID
     */
    @GetMapping("/print-report/blank-quiz")
    public String generateBlankQuiz(@RequestParam("courseId") String courseId,
            @RequestParam("quizId") String quizId,
            Model model,
            RedirectAttributes redirectAttributes) {

        long startTime = System.currentTimeMillis();
        log.info("=== Starting blank quiz generation ===");
        log.info("Course ID: {}, Quiz ID: {}", courseId, quizId);

        try {
            // Validate inputs
            log.debug("Validating input parameters");
            if (courseId == null || courseId.isBlank()) {
                log.warn("Course ID is missing or blank");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Course ID is required");
                return "redirect:/dashboard";
            }

            if (quizId == null || quizId.isBlank()) {
                log.warn("Quiz ID is missing or blank");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Quiz ID is required");
                return "redirect:/dashboard";
            }

            log.info("Input validation passed");

            // Step 1: Fetch quiz from Canvas
            log.info("Step 1/3: Fetching quiz from Canvas...");
            long step1Start = System.currentTimeMillis();
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            long step1Duration = System.currentTimeMillis() - step1Start;
            if (quiz == null) {
                log.error("Failed to fetch quiz from Canvas - quiz is null");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Failed to fetch quiz from Canvas");
                return "redirect:/dashboard";
            }
            log.info("Step 1/3: Successfully fetched quiz '{}' in {}ms", quiz.title(), step1Duration);

            // Step 2: Fetch questions
            log.info("Step 2/3: Fetching quiz questions...");
            long step2Start = System.currentTimeMillis();
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            long step2Duration = System.currentTimeMillis() - step2Start;
            if (questions.isEmpty()) {
                log.error("No questions found for this quiz");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "No questions found for this quiz");
                return "redirect:/dashboard";
            }
            log.info("Step 2/3: Successfully fetched {} questions in {}ms", questions.size(), step2Duration);

            // Step 3: Map to blank quiz view model
            log.info("Step 3/3: Mapping to blank quiz view model...");
            long step3Start = System.currentTimeMillis();
            QuizPrintViewModel viewModel = viewModelMapper.mapToBlankQuizViewModel(quiz, questions);
            long step3Duration = System.currentTimeMillis() - step3Start;
            log.info("Step 3/3: Successfully mapped to blank quiz view model in {}ms", step3Duration);

            // Add to model and render
            long totalDuration = System.currentTimeMillis() - startTime;
            model.addAttribute("quiz", viewModel);
            model.addAttribute("quizTitle", quiz.title());
            model.addAttribute("quizId", quiz.id());
            model.addAttribute("questionCount", questions.size());
            model.addAttribute("totalPoints", questions.stream()
                    .mapToDouble(q -> q.pointsPossible() != null ? q.pointsPossible() : 0.0)
                    .sum());

            log.info("Rendering print-report-blank view");
            log.info("=== Blank quiz generation completed successfully in {}ms ===", totalDuration);
            log.info("Performance breakdown: Quiz={}ms, Questions={}ms, Mapping={}ms",
                    step1Duration, step2Duration, step3Duration);
            return "print-report-blank";

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
            return "redirect:/dashboard";
        } catch (Exception e) {
            log.error("=== Unexpected error generating blank quiz ===", e);
            log.error("Error type: {}", e.getClass().getName());
            log.error(ERROR_MESSAGE_LOG, e.getMessage());
            log.error("Stack trace:", e);
            redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE,
                    "An unexpected error occurred. Please check the logs for details or contact support.");
            return "redirect:/dashboard";
        }
    }

    /**
     * Generate print report from Canvas quiz data and CSV submissions.
     *
     * @param courseId   Canvas course ID
     * @param quizId     Canvas quiz ID
     * @param csvFile    CSV file with student submissions
     * @param reportType "full" or "slip" report type
     */
    @PostMapping("/print-report/generate")
    public String generateReport(@RequestParam("courseId") String courseId,
            @RequestParam("quizId") String quizId,
            @RequestParam("csvFile") MultipartFile csvFile,
            @RequestParam(value = "reportType", defaultValue = "slip") String reportType,
            Model model,
            RedirectAttributes redirectAttributes,
            HttpSession session) {

        long startTime = System.currentTimeMillis();
        log.info("=== Starting print report generation ===");
        log.info("Course ID: {}, Quiz ID: {}, Report Type: {}, CSV File: {} ({} bytes)",
                courseId, quizId, reportType, csvFile.getOriginalFilename(), csvFile.getSize());

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
            log.info("Step 1/5: Fetching quiz from Canvas...");
            long step1Start = System.currentTimeMillis();
            CanvasQuizDto quiz = canvasFetcher.getQuiz(courseId, quizId);
            long step1Duration = System.currentTimeMillis() - step1Start;
            if (quiz == null) {
                log.error("Failed to fetch quiz from Canvas - quiz is null");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "Failed to fetch quiz from Canvas");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 1/5: Successfully fetched quiz '{}' in {}ms", quiz.title(), step1Duration);

            // Step 2: Fetch questions
            log.info("Step 2/5: Fetching quiz questions...");
            long step2Start = System.currentTimeMillis();
            List<CanvasQuestionDto> questions = canvasFetcher.getQuizQuestions(courseId, quizId);
            long step2Duration = System.currentTimeMillis() - step2Start;
            if (questions.isEmpty()) {
                log.error("No questions found for this quiz");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "No questions found for this quiz");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 2/5: Successfully fetched {} questions in {}ms", questions.size(), step2Duration);

            // Store in session for later editing
            session.setAttribute("quiz", quiz);
            session.setAttribute("questions", questions);
            session.setAttribute("courseId", courseId);
            session.setAttribute("quizId", quizId);
            log.debug("Stored quiz and questions data in session for editing");

            // Step 3: Parse CSV submissions
            log.info("Step 3/5: Parsing CSV submissions...");
            long step3Start = System.currentTimeMillis();
            List<StudentSubmission> submissions = csvParser.parseSubmissions(csvFile);
            long step3Duration = System.currentTimeMillis() - step3Start;
            if (submissions.isEmpty()) {
                log.error("No student submissions found in CSV");
                redirectAttributes.addFlashAttribute(ERROR_ATTRIBUTE, "No student submissions found in CSV");
                return REDIRECT_PRINT_REPORT;
            }
            log.info("Step 3/5: Successfully parsed {} student submissions in {}ms",
                    submissions.size(), step3Duration);

            // Step 4: Generate report
            log.info("Step 4/5: Generating print report...");
            long step4Start = System.currentTimeMillis();
            PrintReport report = reportGenerator.generateReport(quiz, questions, submissions);
            long step4Duration = System.currentTimeMillis() - step4Start;
            log.info("Step 4/5: Successfully generated report in {}ms", step4Duration);

            // Step 5: Map to ViewModel for optimized rendering
            log.info("Step 5/5: Mapping to ViewModel for template rendering...");
            long step5Start = System.currentTimeMillis();
            QuizPrintViewModel viewModel = viewModelMapper.mapToViewModel(quiz, questions, submissions, report);
            long step5Duration = System.currentTimeMillis() - step5Start;
            log.info("Step 5/5: Successfully mapped to ViewModel in {}ms", step5Duration);

            // Add to model and render
            long totalDuration = System.currentTimeMillis() - startTime;
            model.addAttribute("quizzes", List.of(viewModel));
            model.addAttribute("studentCount", viewModel.getStudentCount());

            // Route to appropriate template based on report type
            String viewName = "full".equals(reportType) ? "print-report-view" : "print-report-slip";
            log.info("Rendering {} view", viewName);
            log.info("=== Print report generation completed successfully in {}ms ===", totalDuration);
            log.info("Performance breakdown: Quiz={}ms, Questions={}ms, CSV={}ms, Report={}ms, Mapping={}ms",
                    step1Duration, step2Duration, step3Duration, step4Duration, step5Duration);
            return viewName;

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

    /**
     * Update print report with edited data.
     * Re-generates view model with user modifications.
     *
     * @param editedData JSON containing edited student data
     * @param session    HTTP session containing original quiz data
     * @param model      Model for rendering
     * @return Updated print report view
     */
    @PostMapping("/print-report/update")
    public String updateReport(@RequestBody PrintReportEditDto editedData,
            HttpSession session,
            Model model) {

        log.info("=== Updating print report with edited data ===");
        log.info("Received edits for {} students", editedData.getStudents().size());

        try {
            // Retrieve original data from session
            CanvasQuizDto quiz = (CanvasQuizDto) session.getAttribute("quiz");
            List<CanvasQuestionDto> questions = (List<CanvasQuestionDto>) session.getAttribute("questions");

            if (quiz == null || questions == null) {
                log.error("Session data not found - quiz or questions is null");
                model.addAttribute("error", "Session expired. Please regenerate the report.");
                return "error";
            }

            log.info("Retrieved quiz '{}' with {} questions from session", quiz.title(), questions.size());

            // Convert edited data back to StudentSubmission format
            log.info("Converting edited data to StudentSubmission format");
            List<StudentSubmission> updatedSubmissions = editedDataToSubmissions(editedData);

            log.info("Converted {} student submissions", updatedSubmissions.size());

            // Regenerate report with edited data
            log.info("Regenerating report with edited data");
            long reportStart = System.currentTimeMillis();
            PrintReport report = reportGenerator.generateReport(quiz, questions, updatedSubmissions);
            long reportDuration = System.currentTimeMillis() - reportStart;
            log.info("Report regenerated in {}ms", reportDuration);

            // Map to view model
            log.info("Mapping to view model");
            long mappingStart = System.currentTimeMillis();
            QuizPrintViewModel viewModel = viewModelMapper.mapToViewModel(
                    quiz, questions, updatedSubmissions, report);
            long mappingDuration = System.currentTimeMillis() - mappingStart;
            log.info("View model mapped in {}ms", mappingDuration);

            // Return updated view
            model.addAttribute("quizzes", List.of(viewModel));
            model.addAttribute("studentCount", viewModel.getStudentCount());

            log.info("=== Print report update completed successfully ===");
            return "print-report-view";

        } catch (Exception e) {
            log.error("=== Error updating report ===", e);
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            model.addAttribute("error", "Error updating report: " + e.getMessage());
            return "error";
        }
    }

    /**
     * Helper method to convert edited data back to StudentSubmission format.
     * Maps user edits from the web interface back to the internal data structure.
     *
     * @param editedData Edited data from client
     * @return List of StudentSubmission objects
     */
    private List<StudentSubmission> editedDataToSubmissions(PrintReportEditDto editedData) {
        List<StudentSubmission> submissions = new ArrayList<>();

        for (PrintReportEditDto.StudentEdit studentEdit : editedData.getStudents()) {
            StudentSubmission submission = new StudentSubmission();

            // Parse name (assume "FirstName LastName" format, handle edge cases)
            String fullName = studentEdit.getStudentName();
            if (fullName != null && !fullName.isBlank()) {
                String[] nameParts = fullName.trim().split("\\s+", 2);
                submission.setFirstName(nameParts[0]);
                submission.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            } else {
                submission.setFirstName("");
                submission.setLastName("");
            }

            submission.setStudentId(studentEdit.getStudentId());

            // Convert edited answers back to CSV format (e.g., "A,B,C")
            Map<Integer, String> answerMap = new HashMap<>();
            for (int i = 0; i < studentEdit.getQuestions().size(); i++) {
                PrintReportEditDto.QuestionEdit questionEdit = studentEdit.getQuestions().get(i);

                if (questionEdit.getOptions() != null && !questionEdit.getOptions().isEmpty()) {
                    // Collect selected options for multiple-choice questions
                    List<String> selectedOptions = new ArrayList<>();
                    for (int j = 0; j < questionEdit.getOptions().size(); j++) {
                        if (questionEdit.getOptions().get(j).isSelected()) {
                            // Convert option index to letter (A, B, C, ...)
                            char letter = (char) ('A' + j);
                            selectedOptions.add(String.valueOf(letter));
                        }
                    }

                    // Format answer string
                    String answerString = selectedOptions.isEmpty()
                            ? ""
                            : String.join(",", selectedOptions);
                    answerMap.put(i + 1, answerString);

                } else if (questionEdit.getStudentAnswerText() != null) {
                    // Handle essay/text questions
                    answerMap.put(i + 1, questionEdit.getStudentAnswerText());
                }
            }

            submission.setResponses(answerMap);
            submissions.add(submission);
        }

        log.debug("Converted {} student edits to submissions", submissions.size());
        return submissions;
    }

    // ====================================================================================
    // REST API Endpoints for React Frontend
    // ====================================================================================

    /**
     * REST API: Generate print report from Canvas quiz and CSV.
     * Returns JSON instead of rendering template.
     */
    @PostMapping("/print-report/api/generate")
    @ResponseBody
    public QuizPrintViewModel generateReportApi(@RequestParam("courseId") String courseId,
            @RequestParam("quizId") String quizId,
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
            PrintReport report = reportGenerator.generateReport(quiz, questions, submissions);
            log.info("Successfully generated report");

            // Map to view model (same mapping for both full and slip, frontend will handle display)
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
     * REST API: Generate blank quiz worksheet.
     * Returns JSON instead of rendering template.
     */
    @GetMapping("/print-report/api/blank-quiz")
    @ResponseBody
    public QuizPrintViewModel generateBlankQuizApi(@RequestParam("courseId") String courseId,
            @RequestParam("quizId") String quizId) {

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
