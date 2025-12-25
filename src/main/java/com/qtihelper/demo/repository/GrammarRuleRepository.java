package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.GrammarRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for GrammarRule entity.
 * Manages database-driven grammar rules.
 */
@Repository
public interface GrammarRuleRepository extends JpaRepository<GrammarRule, Long> {

    List<GrammarRule> findByEnabledTrueOrderByPriorityDesc();

    List<GrammarRule> findByRuleType(GrammarRule.RuleType ruleType);

    List<GrammarRule> findByTargetTagId(Long tagId);

    List<GrammarRule> findByTargetWord(String targetWord);
}
