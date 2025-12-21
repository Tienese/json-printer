package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.canvas.CanvasCourseDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizSummaryDto;
import com.qtihelper.demo.service.CanvasCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for dashboard with course/quiz browser.
 *
 * Endpoints:
 * - GET /dashboard : Course/quiz browser UI
 * - GET /api/courses : AJAX endpoint for courses list
 * - GET /api/courses/{id}/quizzes : AJAX endpoint for quizzes list
 * - POST /api/cache/refresh : Manual cache refresh
 */
@Controller
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);

    private final CanvasCacheService cacheService;

    public DashboardController(CanvasCacheService cacheService) {
        this.cacheService = cacheService;
    }

    /**
     * AJAX endpoint: Get all courses.
     * Query param: refresh=true to force cache refresh
     */
    @GetMapping("/api/courses")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCourses(
            @RequestParam(value = "refresh", defaultValue = "false") boolean refresh) {

        log.info("API: Fetching courses (refresh={})", refresh);

        try {
            long startTime = System.currentTimeMillis();
            List<CanvasCourseDto> courses = cacheService.getCourses(refresh);
            long duration = System.currentTimeMillis() - startTime;

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "courses", courses,
                    "count", courses.size(),
                    "fetchTime", duration));
        } catch (Exception e) {
            log.error("API error fetching courses", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    /**
     * AJAX endpoint: Get quizzes for a specific course.
     * Query param: refresh=true to force cache refresh
     */
    @GetMapping("/api/courses/{courseId}/quizzes")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getQuizzes(
            @PathVariable String courseId,
            @RequestParam(value = "refresh", defaultValue = "false") boolean refresh) {

        log.info("API: Fetching quizzes for course {} (refresh={})", courseId, refresh);

        try {
            long startTime = System.currentTimeMillis();
            List<CanvasQuizSummaryDto> quizzes = cacheService.getQuizzes(courseId, refresh);
            long duration = System.currentTimeMillis() - startTime;

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "quizzes", quizzes,
                    "count", quizzes.size(),
                    "fetchTime", duration));
        } catch (Exception e) {
            log.error("API error fetching quizzes for course {}", courseId, e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    /**
     * AJAX endpoint: Manually refresh all caches.
     */
    @PostMapping("/api/cache/refresh")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refreshCache() {
        log.info("API: Manual cache refresh requested");

        try {
            cacheService.clearAll();

            // Pre-warm courses cache
            cacheService.getCourses(true);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cache refreshed successfully"));
        } catch (Exception e) {
            log.error("API error refreshing cache", e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
