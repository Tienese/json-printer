package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasCourseDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizSummaryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory caching service for Canvas data.
 * Uses 5-minute TTL with manual refresh capability.
 *
 * Cache Strategy:
 * - Courses: 5 minute TTL (changes infrequently)
 * - Quizzes: 5 minute TTL (may change during course development)
 */
@Service
public class CanvasCacheService {

    private static final Logger log = LoggerFactory.getLogger(CanvasCacheService.class);
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes

    private final CanvasQuizFetcher canvasFetcher;

    private volatile CacheEntry<List<CanvasCourseDto>> coursesCache;
    private final Map<String, CacheEntry<List<CanvasQuizSummaryDto>>> quizzesCache = new ConcurrentHashMap<>();

    public CanvasCacheService(CanvasQuizFetcher canvasFetcher) {
        this.canvasFetcher = canvasFetcher;
    }

    /**
     * Get courses with caching.
     * @param forceRefresh If true, bypass cache and fetch fresh data
     */
    public List<CanvasCourseDto> getCourses(boolean forceRefresh) {
        if (!forceRefresh && coursesCache != null && !coursesCache.isExpired()) {
            log.info("Returning cached courses (age: {}s)", coursesCache.getAgeSeconds());
            return coursesCache.data();
        }

        log.info("Fetching fresh courses from Canvas API");
        long startTime = System.currentTimeMillis();
        List<CanvasCourseDto> courses = canvasFetcher.getCourses();
        long duration = System.currentTimeMillis() - startTime;

        coursesCache = new CacheEntry<>(courses);
        log.info("Cached {} courses (fetch took {}ms)", courses.size(), duration);

        return courses;
    }

    /**
     * Get quizzes for a course with caching.
     * @param courseId Canvas course ID
     * @param forceRefresh If true, bypass cache and fetch fresh data
     */
    public List<CanvasQuizSummaryDto> getQuizzes(String courseId, boolean forceRefresh) {
        CacheEntry<List<CanvasQuizSummaryDto>> cached = quizzesCache.get(courseId);

        if (!forceRefresh && cached != null && !cached.isExpired()) {
            log.info("Returning cached quizzes for course {} (age: {}s)", courseId, cached.getAgeSeconds());
            return cached.data();
        }

        log.info("Fetching fresh quizzes for course {} from Canvas API", courseId);
        long startTime = System.currentTimeMillis();
        List<CanvasQuizSummaryDto> quizzes = canvasFetcher.getQuizzes(courseId);
        long duration = System.currentTimeMillis() - startTime;

        quizzesCache.put(courseId, new CacheEntry<>(quizzes));
        log.info("Cached {} quizzes for course {} (fetch took {}ms)", quizzes.size(), courseId, duration);

        return quizzes;
    }

    /**
     * Clear all caches (manual refresh).
     */
    public void clearAll() {
        log.info("Clearing all caches");
        coursesCache = null;
        quizzesCache.clear();
    }

    /**
     * Internal cache entry with timestamp.
     */
    private record CacheEntry<T>(T data, Instant timestamp) {
        CacheEntry(T data) {
            this(data, Instant.now());
        }

        boolean isExpired() {
            return Instant.now().getEpochSecond() - timestamp.getEpochSecond() > CACHE_TTL_SECONDS;
        }

        long getAgeSeconds() {
            return Instant.now().getEpochSecond() - timestamp.getEpochSecond();
        }
    }
}
