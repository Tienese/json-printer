package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
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
            log.debug("Quiz details - ID: {}, Title: {}", quiz != null ? quiz.id() : "null", quiz != null ? quiz.title() : "null");
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
                    .body(new ParameterizedTypeReference<List<CanvasQuestionDto>>() {});

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
}
