package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.RuleTestSentence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for RuleTestSentence entity.
 */
@Repository
public interface RuleTestSentenceRepository extends JpaRepository<RuleTestSentence, Long> {

    List<RuleTestSentence> findByRuleId(Long ruleId);

    void deleteByRuleId(Long ruleId);
}
