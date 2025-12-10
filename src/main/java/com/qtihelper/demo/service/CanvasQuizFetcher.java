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

import java.util.List;

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
                .baseUrl(props.url())
                .defaultHeader("Authorization", "Bearer " + props.token())
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
            log.error("Failed to fetch quiz {}/{} from Canvas: {}", courseId, quizId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch quiz from Canvas API", e);
        }
    }

    public List<CanvasQuestionDto> getQuizQuestions(String courseId, String quizId) {
        log.info("Fetching questions for quiz {}/{}", courseId, quizId);
        log.debug("Canvas API URL: /api/v1/courses/{}/quizzes/{}/questions?per_page=100", courseId, quizId);

        try {
            List<CanvasQuestionDto> questions = restClient.get()
                    .uri("/api/v1/courses/{courseId}/quizzes/{quizId}/questions?per_page=100",
                            courseId, quizId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CanvasQuestionDto>>() {
                    });

            int questionCount = questions != null ? questions.size() : 0;
            log.info("Successfully fetched {} questions", questionCount);

            if (questions != null && !questions.isEmpty()) {
                log.debug("Question types: {}", questions.stream()
                        .map(CanvasQuestionDto::questionType)
                        .distinct()
                        .toList());
            }

            return questions != null ? questions : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch questions for quiz {}/{}: {}", courseId, quizId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch quiz questions from Canvas API", e);
        }
    }

    /**
     * Fetch all active courses for the authenticated user.
     *
     * @return List of courses where user is enrolled
     */
    public List<CanvasCourseDto> getCourses() {
        log.info("Fetching courses from Canvas");

        try {
            List<CanvasCourseDto> courses = restClient.get()
                .uri("/api/v1/courses?enrollment_state=active&per_page=100")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CanvasCourseDto>>() {});

            int courseCount = courses != null ? courses.size() : 0;
            log.info("Successfully fetched {} courses", courseCount);

            return courses != null ? courses : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch courses: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch courses from Canvas API", e);
        }
    }

    /**
     * Fetch all quizzes for a specific course.
     *
     * @param courseId Canvas course ID
     * @return List of quizzes in the course
     */
    public List<CanvasQuizSummaryDto> getQuizzes(String courseId) {
        log.info("Fetching quizzes for course {}", courseId);

        try {
            List<CanvasQuizSummaryDto> quizzes = restClient.get()
                .uri("/api/v1/courses/{courseId}/quizzes?per_page=100", courseId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<CanvasQuizSummaryDto>>() {});

            int quizCount = quizzes != null ? quizzes.size() : 0;
            log.info("Successfully fetched {} quizzes for course {}", quizCount, courseId);

            return quizzes != null ? quizzes : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch quizzes for course {}: {}", courseId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch quizzes from Canvas API", e);
        }
    }
}
