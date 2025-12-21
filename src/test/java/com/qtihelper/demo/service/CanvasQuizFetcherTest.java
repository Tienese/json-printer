package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(CanvasQuizFetcher.class)
@EnableConfigurationProperties(CanvasProperties.class)
@TestPropertySource(properties = {
        "canvas.url=https://canvas.instructure.com",
        "canvas.token=mock-token"
})
class CanvasQuizFetcherTest {

    @Autowired
    private CanvasQuizFetcher fetcher;

    @Autowired
    private MockRestServiceServer server;

    @Test
    void getQuiz_ReturnsQuizDto() {
        String json = """
                {
                    "id": 1,
                    "title": "Mock Quiz",
                    "description": "Mock Description",
                    "quiz_type": "assignment"
                }
                """;

        server.expect(requestTo("https://canvas.instructure.com/api/v1/courses/123/quizzes/456"))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        CanvasQuizDto quiz = fetcher.getQuiz("123", "456");

        assertNotNull(quiz);
        assertEquals(1L, quiz.id());
        assertEquals("Mock Quiz", quiz.title());
    }

    @Test
    void getQuiz_HandlesError() {
        server.expect(requestTo("https://canvas.instructure.com/api/v1/courses/123/quizzes/999"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(RuntimeException.class, () -> fetcher.getQuiz("123", "999"));
    }
}
