package com.qtihelper.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.entity.GrammarRuleV4;
import com.qtihelper.demo.entity.RuleCondition;
import com.qtihelper.demo.repository.GrammarRuleV4Repository;
import com.qtihelper.demo.repository.RuleConditionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service to load seed data for grammar rules on application startup.
 * 
 * Responsibility: Load pattern and verb-particle rules from JSON seed files
 * Dependencies: GrammarRuleV4Repository, RuleConditionRepository
 */
@Service
public class SeedDataService {

    private static final Logger log = LoggerFactory.getLogger(SeedDataService.class);

    private final GrammarRuleV4Repository ruleRepository;
    private final RuleConditionRepository conditionRepository;
    private final ObjectMapper objectMapper;

    public SeedDataService(
            GrammarRuleV4Repository ruleRepository,
            RuleConditionRepository conditionRepository,
            ObjectMapper objectMapper) {
        this.ruleRepository = ruleRepository;
        this.conditionRepository = conditionRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Load seed data on application startup if no rules exist.
     */
    @PostConstruct
    @Transactional
    public void loadSeedData() {
        if (ruleRepository.count() > 0) {
            log.info("Seed data already exists ({} rules), skipping", ruleRepository.count());
            return;
        }

        log.info("Loading seed data for grammar rules...");

        int patternCount = loadRulesFromResource("/data/pattern-rules-seed.json");
        int verbParticleCount = loadRulesFromResource("/data/verb-particle-rules-seed.json");

        log.info("Loaded {} pattern rules and {} verb-particle rules", patternCount, verbParticleCount);
    }

    /**
     * Load rules from a JSON resource file.
     */
    @SuppressWarnings("unchecked")
    private int loadRulesFromResource(String resourcePath) {
        try {
            InputStream is = getClass().getResourceAsStream(resourcePath);
            if (is == null) {
                log.warn("Resource not found: {}", resourcePath);
                return 0;
            }

            List<Map<String, Object>> seeds = objectMapper.readValue(is,
                    new TypeReference<List<Map<String, Object>>>() {
                    });

            int count = 0;
            for (Map<String, Object> seed : seeds) {
                GrammarRuleV4 rule = createRule(seed);
                rule = ruleRepository.save(rule);

                List<Map<String, Object>> conditions = (List<Map<String, Object>>) seed.get("conditions");
                if (conditions != null) {
                    for (Map<String, Object> condData : conditions) {
                        createCondition(rule.getId(), condData);
                    }
                }
                count++;
            }

            return count;
        } catch (Exception e) {
            log.error("Failed to load seed data from {}", resourcePath, e);
            return 0;
        }
    }

    private GrammarRuleV4 createRule(Map<String, Object> seed) {
        GrammarRuleV4 rule = new GrammarRuleV4();
        rule.setName((String) seed.get("name"));
        rule.setRuleType((String) seed.get("ruleType"));
        rule.setPattern((String) seed.get("pattern"));
        rule.setDescription((String) seed.get("description"));
        rule.setIsActive(true);

        Object lessonId = seed.get("lessonId");
        if (lessonId != null) {
            rule.setLessonId(((Number) lessonId).intValue());
        }

        return rule;
    }

    private void createCondition(Long ruleId, Map<String, Object> condData) {
        RuleCondition cond = new RuleCondition();
        cond.setRuleId(ruleId);
        cond.setTargetPosition((String) condData.get("targetPosition"));
        cond.setConditionType((String) condData.get("conditionType"));
        cond.setConditionValue((String) condData.get("conditionValue"));
        cond.setErrorMessage((String) condData.get("errorMessage"));

        Object isRequired = condData.get("isRequired");
        cond.setIsRequired(isRequired != null && (Boolean) isRequired);

        Object order = condData.get("conditionOrder");
        cond.setConditionOrder(order != null ? ((Number) order).intValue() : 1);

        conditionRepository.save(cond);
    }
}
