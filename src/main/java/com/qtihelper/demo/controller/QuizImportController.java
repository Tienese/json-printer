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
}
