package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.quiz.QuizValidationResult;
import com.qtihelper.demo.dto.quiz.UserAnswer;
import com.qtihelper.demo.dto.quiz.UserQuestion;
import com.qtihelper.demo.dto.quiz.UserQuizJson;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JsonQuizParserServiceTest {

    private JsonQuizParserService service;

    @BeforeEach
    void setUp() {
        service = new JsonQuizParserService();
    }

    @Test
    void parseJsonString_ValidJson_ReturnsUserQuizJson() {
        String json = """
            {
                "title": "My Test Quiz",
                "description": "A description",
                "questions": [
                    {
                        "prompt": "What is 1+1?",
                        "type": "MC",
                        "answers": [
                            { "text": "2", "correct": true },
                            { "text": "3", "correct": false }
                        ]
                    }
                ]
            }
            """;

        UserQuizJson result = service.parseJsonString(json);

        assertNotNull(result);
        assertEquals("My Test Quiz", result.getTitle());
        assertEquals("A description", result.getDescription());
        assertEquals(1, result.getQuestions().size());
        assertEquals("What is 1+1?", result.getQuestions().get(0).getPrompt());
        assertEquals("MC", result.getQuestions().get(0).getType());
        assertTrue(result.getQuestions().get(0).getAnswers().get(0).getCorrect());
    }

    @Test
    void parseJsonString_EmptyJson_ThrowsException() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> 
            service.parseJsonString("   ")
        );
        assertTrue(exception.getMessage().contains("cannot be empty"));
    }

    @Test
    void parseJsonString_InvalidJsonSyntax_ThrowsException() {
        String invalidJson = "{ title: 'Missing quotes' }";
        Exception exception = assertThrows(IllegalArgumentException.class, () -> 
            service.parseJsonString(invalidJson)
        );
        assertTrue(exception.getMessage().contains("Invalid JSON format"));
    }

    @Test
    void parseJsonFile_ValidFile_ReturnsUserQuizJson() throws IOException {
        String jsonContent = """
            {
                "title": "File Quiz",
                "questions": [
                    {
                        "prompt": "Q1",
                        "type": "TF",
                        "answers": [{ "text": "True", "correct": true }]
                    }
                ]
            }
            """;
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "quiz.json",
            "application/json",
            jsonContent.getBytes(StandardCharsets.UTF_8)
        );

        UserQuizJson result = service.parseJsonFile(file);

        assertNotNull(result);
        assertEquals("File Quiz", result.getTitle());
    }

    @Test
    void parseJsonFile_InvalidExtension_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "quiz.txt",
            "text/plain",
            "{}".getBytes(StandardCharsets.UTF_8)
        );

        Exception exception = assertThrows(IllegalArgumentException.class, () -> 
            service.parseJsonFile(file)
        );
        assertTrue(exception.getMessage().contains("must be a JSON file"));
    }

    @Test
    void validateQuizDetailed_ValidQuiz_ReturnsValidResult() {
        UserQuizJson quiz = createValidQuiz();
        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void validateQuizDetailed_MissingTitle_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        quiz.setTitle("");

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("title is required")));
    }

    @Test
    void validateQuizDetailed_NoQuestions_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        quiz.setQuestions(new ArrayList<>());

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("at least one question")));
    }

    @Test
    void validateQuizDetailed_QuestionMissingPrompt_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        quiz.getQuestions().get(0).setPrompt(null);

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("Prompt is required")));
    }

    @Test
    void validateQuizDetailed_NoCorrectAnswer_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        quiz.getQuestions().get(0).getAnswers().forEach(a -> a.setCorrect(false));

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("No correct answer marked")));
    }

    @Test
    void validateQuizDetailed_MultipleCorrectAnswersForMC_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        UserQuestion question = quiz.getQuestions().get(0);
        question.setType("MC");
        // Add another correct answer
        question.getAnswers().add(new UserAnswer("Another correct", true, "Feedback"));

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("Multiple correct answers")));
    }

    @Test
    void validateQuizDetailed_MultipleCorrectAnswersForMA_ReturnsValid() {
        UserQuizJson quiz = createValidQuiz();
        UserQuestion question = quiz.getQuestions().get(0);
        question.setType("MA");
        // Add another correct answer
        question.getAnswers().add(new UserAnswer("Another correct", true, "Feedback"));

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void validateQuizDetailed_MissingOptionalFields_ReturnsValidWithWarnings() {
        UserQuizJson quiz = createValidQuiz();
        quiz.setDescription(null);
        quiz.getQuestions().get(0).setGeneralFeedback(null);
        quiz.getQuestions().get(0).getAnswers().get(0).setFeedback(null);

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertTrue(result.isValid());
        assertFalse(result.getWarnings().isEmpty());
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.contains("description is missing")));
        assertTrue(result.getWarnings().stream().anyMatch(w -> w.contains("General feedback is missing")));
    }

    @Test
    void validateQuizDetailed_ValidMTQuestion_ReturnsValid() {
        UserQuizJson quiz = createValidQuiz();
        UserQuestion q = quiz.getQuestions().get(0);
        q.setType("MT");
        q.setAnswers(new ArrayList<>()); // Matching doesn't use standard answers
        
        List<UserQuestion.MatchPair> pairs = new ArrayList<>();
        pairs.add(new UserQuestion.MatchPair("Left", "Right"));
        q.setMatchingPairs(pairs);

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void validateQuizDetailed_InvalidMTQuestion_ReturnsError() {
        UserQuizJson quiz = createValidQuiz();
        UserQuestion q = quiz.getQuestions().get(0);
        q.setType("MT");
        q.setAnswers(new ArrayList<>());
        q.setMatchingPairs(null);
        q.setMatches(null);
        q.setLeftColumn(null);

        QuizValidationResult result = service.validateQuizDetailed(quiz);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("must have matches")));
    }

    private UserQuizJson createValidQuiz() {
        UserQuizJson quiz = new UserQuizJson();
        quiz.setTitle("Valid Quiz");
        quiz.setDescription("Description");
        
        List<UserQuestion> questions = new ArrayList<>();
        UserQuestion q1 = new UserQuestion();
        q1.setPrompt("Question 1");
        q1.setType("MC");
        q1.setGeneralFeedback("Good job");
        
        List<UserAnswer> answers = new ArrayList<>();
        answers.add(new UserAnswer("Answer 1", true, "Correct feedback"));
        answers.add(new UserAnswer("Answer 2", false, "Incorrect feedback"));
        
        q1.setAnswers(answers);
        questions.add(q1);
        
        quiz.setQuestions(questions);
        return quiz;
    }
}
