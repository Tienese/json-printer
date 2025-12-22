package com.qtihelper.demo;

import com.qtihelper.demo.entity.Quiz;
import com.qtihelper.demo.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseTests {

    @Autowired
    private QuizRepository quizRepository;

    @Test
    void testQuizPersistence() {
        Quiz quiz = new Quiz(1L, "Test Quiz", "Description", 10);
        quizRepository.save(quiz);

        Quiz retrieved = quizRepository.findById(1L).orElse(null);
        assertThat(retrieved).isNotNull();
        assertThat(retrieved.getTitle()).isEqualTo("Test Quiz");

        quizRepository.delete(quiz);
    }
}
