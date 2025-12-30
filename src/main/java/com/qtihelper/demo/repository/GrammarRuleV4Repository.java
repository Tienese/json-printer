package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.GrammarRuleV4;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for GrammarRuleV4 entity.
 */
@Repository
public interface GrammarRuleV4Repository extends JpaRepository<GrammarRuleV4, Long> {

    List<GrammarRuleV4> findByRuleType(String ruleType);

    List<GrammarRuleV4> findByParticle(String particle);

    List<GrammarRuleV4> findByIsActiveTrue();

    List<GrammarRuleV4> findByLessonId(Integer lessonId);

    List<GrammarRuleV4> findAllByOrderByUpdatedAtDesc();
}
