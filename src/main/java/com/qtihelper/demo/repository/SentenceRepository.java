package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.Sentence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Sentence entity.
 */
@Repository
public interface SentenceRepository extends JpaRepository<Sentence, Long> {

    List<Sentence> findByLessonId(Integer lessonId);

    List<Sentence> findByValidationStatus(String status);

    List<Sentence> findAllByOrderByUpdatedAtDesc();
}
