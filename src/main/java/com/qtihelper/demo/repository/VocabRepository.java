package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.Vocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Vocab persistence operations.
 */
@Repository
public interface VocabRepository extends JpaRepository<Vocab, Long> {

    /**
     * Find all vocabulary for a specific lesson.
     */
    List<Vocab> findByLessonId(Integer lessonId);

    /**
     * Find all vocabulary for multiple lessons (for cumulative reviews).
     */
    List<Vocab> findByLessonIdIn(List<Integer> lessonIds);

    /**
     * Delete all vocabulary for a specific lesson (for CSV reload).
     */
    @Modifying
    void deleteByLessonId(Integer lessonId);

    /**
     * Count vocabulary for a specific lesson.
     */
    long countByLessonId(Integer lessonId);
}
