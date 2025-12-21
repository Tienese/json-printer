package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.SavedQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SavedQuiz persistence operations.
 */
@Repository
public interface SavedQuizRepository extends JpaRepository<SavedQuiz, Long> {

    /**
     * Find a saved quiz by Canvas quiz ID.
     */
    Optional<SavedQuiz> findByCanvasQuizId(String canvasQuizId);

    /**
     * Check if a quiz exists by Canvas ID.
     */
    boolean existsByCanvasQuizId(String canvasQuizId);
}
