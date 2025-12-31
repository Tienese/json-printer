package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.Vocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Find vocabulary by base form (for validation).
     */
    List<Vocab> findByBaseForm(String baseForm);

    /**
     * Find vocabulary by display form (for validation).
     */
    List<Vocab> findByDisplayForm(String displayForm);

    /**
     * Find vocabulary by lesson range (for cumulative filtering).
     */
    List<Vocab> findByLessonIdBetween(Integer start, Integer end);

    /**
     * Find vocabulary by category.
     */
    List<Vocab> findByCategory(String category);

    /**
     * Find distinct lesson IDs for dropdown filter.
     */
    @Query("SELECT DISTINCT v.lessonId FROM Vocab v ORDER BY v.lessonId")
    List<Integer> findDistinctLessonIds();

    /**
     * Search vocabulary by display form or base form containing search term.
     */
    @Query("SELECT v FROM Vocab v WHERE LOWER(v.displayForm) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(v.baseForm) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Vocab> searchByDisplayFormOrBaseForm(@Param("search") String search);
}
