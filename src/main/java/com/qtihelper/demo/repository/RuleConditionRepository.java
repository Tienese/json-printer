package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.RuleCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for RuleCondition entity.
 */
@Repository
public interface RuleConditionRepository extends JpaRepository<RuleCondition, Long> {

    List<RuleCondition> findByRuleIdOrderByConditionOrder(Long ruleId);

    void deleteByRuleId(Long ruleId);
}
