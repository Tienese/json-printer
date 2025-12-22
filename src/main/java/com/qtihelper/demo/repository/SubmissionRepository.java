package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByQuizId(Long quizId);
    List<Submission> findByStudentStudentId(String studentId);
}
