package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.quiz.QuizValidationResult;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import com.qtihelper.demo.service.JsonQuizParserService;
import com.qtihelper.demo.service.QuizImportManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Controller for Quiz Import and QTI Conversion workflow.
 *
 * Endpoints:
 * - GET /quiz/import      : Upload/paste JSON page
 * - POST /quiz/parse      : Parse JSON and show editor
 * - POST /quiz/process    : Generate QTI and import to Canvas
 */
@Controller
@RequestMapping("/quiz")
public class QuizImportController {

    private static final Logger log = LoggerFactory.getLogger(QuizImportController.class);
    private static final String REDIRECT_QUIZ_IMPORT = "redirect:/quiz/import";

    private final JsonQuizParserService jsonParserService;
    private final QuizImportManager quizImportManager;

    public QuizImportController(JsonQuizParserService jsonParserService,
                               QuizImportManager quizImportManager) {
        this.jsonParserService = jsonParserService;
        this.quizImportManager = quizImportManager;
    }

    /**
     * Show quiz import page - upload or paste JSON.
     */
    @GetMapping("/import")
    public String showImportPage() {
        log.info("Quiz import page accessed");
        return "quiz-import";
    }

    /**
     * Parse uploaded JSON file or pasted JSON text.
     * Show editor view for modification.
     */
    @PostMapping("/parse")
    public String parseQuizJson(@RequestParam(value = "jsonFile", required = false) MultipartFile jsonFile,
                                @RequestParam(value = "jsonText", required = false) String jsonText,
                                Model model,
                                RedirectAttributes redirectAttributes) {

        log.info("=== Starting quiz JSON parsing ===");
        log.info("File uploaded: {}, Text provided: {}",
                jsonFile != null && !jsonFile.isEmpty(),
                jsonText != null && !jsonText.isBlank());

        try {
            UserQuizJson quiz;

            // Prioritize file upload over text
            if (jsonFile != null && !jsonFile.isEmpty()) {
                log.info("Parsing JSON file: {} ({} bytes)",
                        jsonFile.getOriginalFilename(), jsonFile.getSize());
                quiz = jsonParserService.parseJsonFile(jsonFile);
            } else if (jsonText != null && !jsonText.isBlank()) {
                log.info("Parsing JSON text ({} characters)", jsonText.length());
                quiz = jsonParserService.parseJsonString(jsonText);
            } else {
                log.warn("No JSON file or text provided");
                redirectAttributes.addFlashAttribute("error",
                        "Please upload a JSON file or paste JSON text");
                return REDIRECT_QUIZ_IMPORT;
            }

            log.info("Successfully parsed quiz: {}", quiz);

            // Add to model for editor view
            model.addAttribute("quiz", quiz);
            model.addAttribute("questionCount", quiz.getQuestions().size());

            // Store in session for later processing
            // (Alternative: use hidden form fields or re-serialize in form)
            model.addAttribute("quizJson", jsonParserService.toJsonString(quiz));

            log.info("=== Quiz parsing completed successfully ===");
            return "quiz-editor";

        } catch (IllegalArgumentException e) {
            log.error("Validation error parsing quiz JSON", e);
            redirectAttributes.addFlashAttribute("error",
                    "Invalid quiz format: " + e.getMessage());
            return REDIRECT_QUIZ_IMPORT;
        } catch (java.io.IOException e) {
            log.error("IO error reading quiz JSON", e);
            redirectAttributes.addFlashAttribute("error",
                    "Failed to read JSON file: " + e.getMessage());
            return REDIRECT_QUIZ_IMPORT;
        } catch (Exception e) {
            log.error("Unexpected error parsing quiz JSON", e);
            redirectAttributes.addFlashAttribute("error",
                    "An unexpected error occurred: " + e.getMessage());
            return REDIRECT_QUIZ_IMPORT;
        }
    }

    /**
     * Process edited quiz data and generate QTI package.
     * Import to Canvas as Question Bank.
     */
    @PostMapping("/process")
    public String processAndImportQuiz(@RequestParam("courseId") String courseId,
                                      @RequestParam("quizJson") String quizJson,
                                      Model model,
                                      RedirectAttributes redirectAttributes) {

        log.info("=== Starting QTI generation and Canvas import ===");
        log.info("Course ID: {}", courseId);

        try {
            // Validate course ID
            if (courseId == null || courseId.isBlank()) {
                log.warn("Course ID is missing");
                redirectAttributes.addFlashAttribute("error", "Course ID is required");
                return REDIRECT_QUIZ_IMPORT;
            }

            // Re-parse the quiz JSON (edited form data)
            UserQuizJson quiz = jsonParserService.parseJsonString(quizJson);
            log.info("Parsed quiz for processing: {}", quiz);

            // Call orchestration service to process and import
            QuizImportManager.ImportResult result = quizImportManager.processAndImport(quiz, courseId);

            if (result.isSuccess()) {
                // Success - add details to model
                model.addAttribute("success", result.getMessage());
                model.addAttribute("quiz", quiz);
                model.addAttribute("importResult", result);

                log.info("=== QTI generation and import completed successfully ===");
                return "quiz-import-success";
            } else {
                // Failed - redirect with error
                log.error("QTI import failed: {}", result.getError());
                redirectAttributes.addFlashAttribute("error",
                        "Import failed: " + result.getMessage());
                return REDIRECT_QUIZ_IMPORT;
            }

        } catch (IllegalArgumentException e) {
            log.error("Validation error processing quiz", e);
            redirectAttributes.addFlashAttribute("error",
                    "Invalid quiz data: " + e.getMessage());
            return REDIRECT_QUIZ_IMPORT;
        } catch (Exception e) {
            log.error("Unexpected error processing quiz", e);
            redirectAttributes.addFlashAttribute("error",
                    "An unexpected error occurred: " + e.getMessage());
            return REDIRECT_QUIZ_IMPORT;
        }
    }

    /**
     * Validate quiz JSON without importing.
     * Returns validation result with errors and warnings.
     */
    @PostMapping("/validate")
    @ResponseBody
    public QuizValidationResult validateQuiz(@RequestBody String jsonString) {
        log.info("Validating quiz JSON ({} characters)", jsonString != null ? jsonString.length() : 0);

        try {
            UserQuizJson quiz = jsonParserService.parseJsonString(jsonString);
            QuizValidationResult result = jsonParserService.validateQuizDetailed(quiz);

            log.info("Validation result: valid={}, errors={}, warnings={}",
                     result.isValid(), result.getErrors().size(), result.getWarnings().size());

            return result;

        } catch (IllegalArgumentException e) {
            log.warn("Validation failed: {}", e.getMessage());
            // The exception message already contains validation details
            QuizValidationResult result = QuizValidationResult.success();
            result.addError(e.getMessage());
            return result;
        } catch (Exception e) {
            log.error("Unexpected error during validation", e);
            QuizValidationResult result = QuizValidationResult.success();
            result.addError("Unexpected error: " + e.getMessage());
            return result;
        }
    }

    // ====================================================================================
    // REST API Endpoints for React Frontend
    // ====================================================================================

    /**
     * REST API: Parse uploaded JSON file or pasted JSON text.
     * Returns parsed quiz data as JSON.
     */
    @PostMapping("/api/parse")
    @ResponseBody
    public ParseQuizResponse parseQuizJsonApi(@RequestParam(value = "jsonFile", required = false) MultipartFile jsonFile,
                                              @RequestParam(value = "jsonText", required = false) String jsonText) {

        log.info("=== API: Starting quiz JSON parsing ===");
        log.info("File uploaded: {}, Text provided: {}",
                jsonFile != null && !jsonFile.isEmpty(),
                jsonText != null && !jsonText.isBlank());

        try {
            UserQuizJson quiz;

            // Prioritize file upload over text
            if (jsonFile != null && !jsonFile.isEmpty()) {
                log.info("Parsing JSON file: {} ({} bytes)",
                        jsonFile.getOriginalFilename(), jsonFile.getSize());
                quiz = jsonParserService.parseJsonFile(jsonFile);
            } else if (jsonText != null && !jsonText.isBlank()) {
                log.info("Parsing JSON text ({} characters)", jsonText.length());
                quiz = jsonParserService.parseJsonString(jsonText);
            } else {
                throw new IllegalArgumentException("Please upload a JSON file or paste JSON text");
            }

            log.info("Successfully parsed quiz: {}", quiz);

            ParseQuizResponse response = new ParseQuizResponse();
            response.setQuiz(quiz);
            response.setQuestionCount(quiz.getQuestions().size());

            log.info("=== API: Quiz parsing completed successfully ===");
            return response;

        } catch (IllegalArgumentException e) {
            log.error("Validation error parsing quiz JSON", e);
            throw new RuntimeException("Invalid quiz format: " + e.getMessage());
        } catch (java.io.IOException e) {
            log.error("IO error reading quiz JSON", e);
            throw new RuntimeException("Failed to read JSON file: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error parsing quiz JSON", e);
            throw new RuntimeException("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * REST API: Process edited quiz data and generate QTI package.
     * Import to Canvas as Question Bank.
     */
    @PostMapping("/api/process")
    @ResponseBody
    public ProcessQuizResponse processAndImportQuizApi(@RequestBody ProcessQuizRequest request) {

        log.info("=== API: Starting QTI generation and Canvas import ===");
        log.info("Course ID: {}", request.getCourseId());

        try {
            // Validate course ID
            if (request.getCourseId() == null || request.getCourseId().isBlank()) {
                throw new IllegalArgumentException("Course ID is required");
            }

            // Parse the quiz JSON (edited form data)
            UserQuizJson quiz = jsonParserService.parseJsonString(request.getQuizJson());
            log.info("Parsed quiz for processing: {}", quiz);

            // Call orchestration service to process and import
            QuizImportManager.ImportResult result = quizImportManager.processAndImport(quiz, request.getCourseId());

            ProcessQuizResponse response = new ProcessQuizResponse();
            response.setSuccess(result.isSuccess());
            response.setMessage(result.getMessage());
            response.setQuiz(quiz);
            response.setImportResult(result);

            if (result.isSuccess()) {
                log.info("=== API: QTI generation and import completed successfully ===");
            } else {
                log.error("API: QTI import failed: {}", result.getError());
            }

            return response;

        } catch (IllegalArgumentException e) {
            log.error("Validation error processing quiz", e);
            throw new RuntimeException("Invalid quiz data: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error processing quiz", e);
            throw new RuntimeException("An unexpected error occurred: " + e.getMessage());
        }
    }

    // ====================================================================================
    // DTOs for REST API
    // ====================================================================================

    /**
     * Response DTO for parse quiz API.
     */
    public static class ParseQuizResponse {
        private UserQuizJson quiz;
        private int questionCount;

        public UserQuizJson getQuiz() {
            return quiz;
        }

        public void setQuiz(UserQuizJson quiz) {
            this.quiz = quiz;
        }

        public int getQuestionCount() {
            return questionCount;
        }

        public void setQuestionCount(int questionCount) {
            this.questionCount = questionCount;
        }
    }

    /**
     * Request DTO for process quiz API.
     */
    public static class ProcessQuizRequest {
        private String courseId;
        private String quizJson;

        public String getCourseId() {
            return courseId;
        }

        public void setCourseId(String courseId) {
            this.courseId = courseId;
        }

        public String getQuizJson() {
            return quizJson;
        }

        public void setQuizJson(String quizJson) {
            this.quizJson = quizJson;
        }
    }

    /**
     * Response DTO for process quiz API.
     */
    public static class ProcessQuizResponse {
        private boolean success;
        private String message;
        private UserQuizJson quiz;
        private QuizImportManager.ImportResult importResult;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public UserQuizJson getQuiz() {
            return quiz;
        }

        public void setQuiz(UserQuizJson quiz) {
            this.quiz = quiz;
        }

        public QuizImportManager.ImportResult getImportResult() {
            return importResult;
        }

        public void setImportResult(QuizImportManager.ImportResult importResult) {
            this.importResult = importResult;
        }
    }
}
