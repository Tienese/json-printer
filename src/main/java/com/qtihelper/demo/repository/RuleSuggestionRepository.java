package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.RuleSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for RuleSuggestion entity.
 * Manages suggestions linked to grammar rules.
 */
@Repository
public interface RuleSuggestionRepository extends JpaRepository<RuleSuggestion, Long> {

    List<RuleSuggestion> findByRuleIdOrderByPriorityDesc(Long ruleId);

    void deleteByRuleId(Long ruleId);
}
