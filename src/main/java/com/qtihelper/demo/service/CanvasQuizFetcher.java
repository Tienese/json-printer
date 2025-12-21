package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import com.qtihelper.demo.dto.canvas.CanvasCourseDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizSummaryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.qtihelper.demo.exception.CanvasApiException;

import java.util.List;
import java.util.Objects;

@Service
public class CanvasQuizFetcher {

    private static final Logger log = LoggerFactory.getLogger(CanvasQuizFetcher.class);
    private final RestClient restClient;

    public CanvasQuizFetcher(CanvasProperties props, RestClient.Builder builder) {
        log.info("Initializing Canvas API client");
        log.debug("Canvas URL: {}", props.url());
        log.debug("Canvas token: {}****", props.token() != null && props.token().length() > 4
                ? props.token().substring(0, 4)
                : "****");

        this.restClient = builder
                .baseUrl(Objects.requireNonNull(props.url(), "Canvas URL must be configured"))
                .defaultHeader("Authorization",
                        "Bearer " + Objects.requireNonNull(props.token(), "Canvas token must be configured"))
                .build();
    }

    public CanvasQuizDto getQuiz(String courseId, String quizId) {
        log.info("Fetching quiz {}/{} from Canvas", courseId, quizId);
        log.debug("Canvas API URL: /api/v1/courses/{}/quizzes/{}", courseId, quizId);

        try {
            CanvasQuizDto quiz = restClient.get()
                    .uri("/api/v1/courses/{courseId}/quizzes/{quizId}", courseId, quizId)
                    .retrieve()
                    .body(CanvasQuizDto.class);

            log.info("Successfully fetched quiz: {}", quiz != null ? quiz.title() : "null");
            log.debug("Quiz details - ID: {}, Title: {}", quiz != null ? quiz.id() : "null",
                    quiz != null ? quiz.title() : "null");
            return quiz;
        } catch (Exception e) {
            throw new CanvasApiException(
                    "Failed to fetch quiz " + courseId + "/" + quizId + " from Canvas: " + e.getMessage(), e);
        }
    }

    public List<CanvasQuestionDto> getQuizQuestions(String courseId, String quizId) {
        log.info("Fetching questions for quiz {}/{}", courseId, quizId);
        String url = String.format("/api/v1/courses/%s/quizzes/%s/questions?per_page=100", courseId, quizId);
        return fetchAllPages(url, new ParameterizedTypeReference<List<CanvasQuestionDto>>() {
        });
    }

    /**
     * Fetch all active courses for the authenticated user.
     *
     * @return List of courses where user is enrolled
     */
    public List<CanvasCourseDto> getCourses() {
        log.info("Fetching courses from Canvas");
        return fetchAllPages("/api/v1/courses?enrollment_state=active&per_page=100",
                new ParameterizedTypeReference<List<CanvasCourseDto>>() {
                });
    }

    /**
     * Fetch all quizzes for a specific course.
     *
     * @param courseId Canvas course ID
     * @return List of quizzes in the course
     */
    public List<CanvasQuizSummaryDto> getQuizzes(String courseId) {
        log.info("Fetching quizzes for course {}", courseId);
        String url = String.format("/api/v1/courses/%s/quizzes?per_page=100", courseId);
        return fetchAllPages(url, new ParameterizedTypeReference<List<CanvasQuizSummaryDto>>() {
        });
    }

    /**
     * Generic method to fetch all pages of a paginated Canvas API resource.
     * Follows RFC 5988 Link headers.
     */
    private <T> List<T> fetchAllPages(String initialUrl, ParameterizedTypeReference<List<T>> typeRef) {
        List<T> allResults = new java.util.ArrayList<>();
        String nextUrl = initialUrl;

        while (nextUrl != null) {
            log.debug("Fetching page: {}", nextUrl);

            try {
                var responseEntity = restClient.get()
                        .uri(nextUrl)
                        .retrieve()
                        .toEntity(typeRef != null ? typeRef : new ParameterizedTypeReference<List<T>>() {
                        });

                List<T> pageResults = responseEntity.getBody();
                if (pageResults != null) {
                    allResults.addAll(pageResults);
                }

                // Parse Link header for next page
                // Header format: <https://canvas.instructure.com/api/v1/...>; rel="current",
                // <https://canvas.instructure.com/api/v1/...>; rel="next"
                String linkHeader = responseEntity.getHeaders().getFirst("Link");
                nextUrl = parseNextUrl(linkHeader);

            } catch (Exception e) {
                throw new CanvasApiException("Canvas API pagination failed at " + nextUrl + ": " + e.getMessage(), e);
            }
        }

        log.info("Total items fetched: {}", allResults.size());
        return allResults;
    }

    /**
     * Extracts the 'next' URL from the Link header.
     * Returns null if no next page exists.
     */
    private String parseNextUrl(String linkHeader) {
        if (linkHeader == null || linkHeader.isEmpty()) {
            return null;
        }

        // Regex to match <url>; rel="next"
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("<([^>]+)>;\\s*rel=\"next\"");
        java.util.regex.Matcher matcher = pattern.matcher(linkHeader);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }
}
