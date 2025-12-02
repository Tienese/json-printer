package com.qtihelper.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.model.Quiz;
import com.qtihelper.demo.parser.QuizParser;
import com.qtihelper.demo.service.CanvasUploader;
import com.qtihelper.demo.writer.QtiWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Controller
public class WebController {

    private static final Logger log = LoggerFactory.getLogger(WebController.class);
    private static final Path INPUT_FILE = Paths.get("input.json");

    private final QuizParser parser;
    private final QtiWriter writer;
    private final CanvasUploader uploader;
    private final ObjectMapper objectMapper;

    public WebController(QuizParser parser, QtiWriter writer, CanvasUploader uploader, ObjectMapper objectMapper) {
        this.parser = parser;
        this.writer = writer;
        this.uploader = uploader;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/")
    public ModelAndView index() {
        return new ModelAndView("index");
    }

    @GetMapping("/api/quiz")
    @ResponseBody
    public Map<String, Object> loadQuiz() {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!Files.exists(INPUT_FILE)) {
                response.put("success", false);
                response.put("message", "input.json not found");
                return response;
            }

            String jsonContent = Files.readString(INPUT_FILE);
            response.put("success", true);
            response.put("data", objectMapper.readValue(jsonContent, Object.class));
        } catch (IOException e) {
            log.error("Failed to load quiz", e);
            response.put("success", false);
            response.put("message", "Error reading file: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/api/quiz/save")
    @ResponseBody
    public Map<String, Object> saveQuiz(@RequestBody Map<String, Object> quizData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String jsonContent = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(quizData);
            Files.writeString(INPUT_FILE, jsonContent);

            response.put("success", true);
            response.put("message", "Quiz saved successfully to input.json");
            log.info("Quiz saved to {}", INPUT_FILE.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to save quiz", e);
            response.put("success", false);
            response.put("message", "Error saving file: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/api/quiz/canvas")
    @ResponseBody
    public Map<String, Object> sendToCanvas(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String courseId = (String) request.get("courseId");
            @SuppressWarnings("unchecked")
            Map<String, Object> quizData = (Map<String, Object>) request.get("quizData");

            if (courseId == null || courseId.isBlank()) {
                response.put("success", false);
                response.put("message", "Course ID is required");
                return response;
            }

            // Save quiz data temporarily
            String tempJson = objectMapper.writeValueAsString(quizData);
            Path tempFile = Files.createTempFile("quiz_temp_", ".json");
            Files.writeString(tempFile, tempJson);

            // Parse and generate QTI package
            Quiz quiz = parser.parse(tempFile);
            Path zipFile = Files.createTempFile("quiz_", ".zip");
            writer.createQtiPackage(quiz, zipFile);

            // Upload to Canvas
            boolean success = uploader.uploadAndMigrate(courseId, quiz.getTitle(), zipFile);

            // Cleanup
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(zipFile);

            if (success) {
                response.put("success", true);
                response.put("message", "Quiz uploaded to Canvas successfully!");
            } else {
                response.put("success", false);
                response.put("message", "Failed to upload to Canvas. Check logs for details.");
            }

        } catch (Exception e) {
            log.error("Failed to send to Canvas", e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }
}