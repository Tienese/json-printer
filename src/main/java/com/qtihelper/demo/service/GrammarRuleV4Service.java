package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.ValidationResultDTO;
import com.qtihelper.demo.entity.GrammarRuleV4;
import com.qtihelper.demo.entity.RuleCondition;
import com.qtihelper.demo.entity.RuleTestSentence;
import com.qtihelper.demo.repository.GrammarRuleV4Repository;
import com.qtihelper.demo.repository.RuleConditionRepository;
import com.qtihelper.demo.repository.RuleTestSentenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for GrammarRuleV4 CRUD and condition management.
 * 
 * Responsibility: Grammar rule management for V4.0
 * Dependencies: GrammarRuleV4Repository, RuleConditionRepository,
 * RuleTestSentenceRepository
 */
@Service
public class GrammarRuleV4Service {

    private static final Logger log = LoggerFactory.getLogger(GrammarRuleV4Service.class);

    private final GrammarRuleV4Repository ruleRepository;
    private final RuleConditionRepository conditionRepository;
    private final RuleTestSentenceRepository testSentenceRepository;
    private final SentenceValidationService validationService;

    public GrammarRuleV4Service(
            GrammarRuleV4Repository ruleRepository,
            RuleConditionRepository conditionRepository,
            RuleTestSentenceRepository testSentenceRepository,
            SentenceValidationService validationService) {
        this.ruleRepository = ruleRepository;
        this.conditionRepository = conditionRepository;
        this.testSentenceRepository = testSentenceRepository;
        this.validationService = validationService;
    }

    // CRUD Operations

    public List<GrammarRuleV4> findAll() {
        return ruleRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Optional<GrammarRuleV4> findById(Long id) {
        return ruleRepository.findById(id);
    }

    public List<GrammarRuleV4> findByType(String type) {
        return ruleRepository.findByRuleType(type);
    }

    public List<GrammarRuleV4> findByParticle(String particle) {
        return ruleRepository.findByParticle(particle);
    }

    public List<GrammarRuleV4> findActiveRules() {
        return ruleRepository.findByIsActiveTrue();
    }

    public List<GrammarRuleV4> findByLessonId(Integer lessonId) {
        return ruleRepository.findByLessonId(lessonId);
    }

    @Transactional
    public GrammarRuleV4 save(GrammarRuleV4 rule) {
        return ruleRepository.save(rule);
    }

    @Transactional
    public void delete(Long id) {
        conditionRepository.deleteByRuleId(id);
        testSentenceRepository.deleteByRuleId(id);
        ruleRepository.deleteById(id);
    }

    // Condition Management

    public List<RuleCondition> getConditions(Long ruleId) {
        return conditionRepository.findByRuleIdOrderByConditionOrder(ruleId);
    }

    @Transactional
    public RuleCondition addCondition(Long ruleId, RuleCondition condition) {
        condition.setRuleId(ruleId);

        // Set order to next available
        List<RuleCondition> existing = conditionRepository.findByRuleIdOrderByConditionOrder(ruleId);
        condition.setConditionOrder(existing.size() + 1);

        return conditionRepository.save(condition);
    }

    @Transactional
    public void removeCondition(Long conditionId) {
        conditionRepository.deleteById(conditionId);
    }

    // Test Sentence Management

    public List<RuleTestSentence> getTestSentences(Long ruleId) {
        return testSentenceRepository.findByRuleId(ruleId);
    }

    @Transactional
    public RuleTestSentence addTestSentence(Long ruleId, RuleTestSentence testSentence) {
        testSentence.setRuleId(ruleId);
        return testSentenceRepository.save(testSentence);
    }

    @Transactional
    public void removeTestSentence(Long testId) {
        testSentenceRepository.deleteById(testId);
    }

    /**
     * Validate all test sentences for a rule and update results.
     */
    @Transactional
    public List<RuleTestSentence> validateTestSentences(Long ruleId) {
        List<RuleTestSentence> testSentences = testSentenceRepository.findByRuleId(ruleId);

        for (RuleTestSentence test : testSentences) {
            ValidationResultDTO result = validationService.validate(test.getText());

            // PASS = validation passed, FAIL = validation found violations
            String actualResult = result.isValid() ? "PASS" : "FAIL";
            test.setActualResult(actualResult);
            test.setResultMatches(actualResult.equals(test.getExpectedResult()));

            testSentenceRepository.save(test);
        }

        log.info("Validated {} test sentences for rule {}", testSentences.size(), ruleId);
        return testSentences;
    }
}
