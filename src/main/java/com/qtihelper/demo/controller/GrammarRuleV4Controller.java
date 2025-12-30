package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.CreateConditionRequest;
import com.qtihelper.demo.dto.CreateRuleRequest;
import com.qtihelper.demo.dto.CreateTestSentenceRequest;
import com.qtihelper.demo.entity.GrammarRuleV4;
import com.qtihelper.demo.entity.RuleCondition;
import com.qtihelper.demo.entity.RuleTestSentence;
import com.qtihelper.demo.service.GrammarRuleV4Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for GrammarRuleV4 operations.
 * 
 * Responsibility: HTTP endpoints for grammar rule CRUD and test management
 * Dependencies: GrammarRuleV4Service
 */
@RestController
@RequestMapping("/api/grammar-rules-v4")
public class GrammarRuleV4Controller {

    private final GrammarRuleV4Service ruleService;

    public GrammarRuleV4Controller(GrammarRuleV4Service ruleService) {
        this.ruleService = ruleService;
    }

    @GetMapping
    public List<GrammarRuleV4> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String particle,
            @RequestParam(required = false) Integer lessonId) {
        if (type != null) {
            return ruleService.findByType(type);
        }
        if (particle != null) {
            return ruleService.findByParticle(particle);
        }
        if (lessonId != null) {
            return ruleService.findByLessonId(lessonId);
        }
        return ruleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrammarRuleV4> getById(@PathVariable Long id) {
        return ruleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GrammarRuleV4> create(@RequestBody CreateRuleRequest request) {
        GrammarRuleV4 rule = new GrammarRuleV4();
        rule.setName(request.name());
        rule.setRuleType(request.ruleType());
        rule.setParticle(request.particle());
        rule.setPattern(request.pattern());
        rule.setLessonId(request.lessonId());
        rule.setDescription(request.description());

        GrammarRuleV4 saved = ruleService.save(rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrammarRuleV4> update(
            @PathVariable Long id,
            @RequestBody CreateRuleRequest request) {
        return ruleService.findById(id)
                .map(rule -> {
                    if (request.name() != null)
                        rule.setName(request.name());
                    if (request.ruleType() != null)
                        rule.setRuleType(request.ruleType());
                    if (request.particle() != null)
                        rule.setParticle(request.particle());
                    if (request.pattern() != null)
                        rule.setPattern(request.pattern());
                    if (request.lessonId() != null)
                        rule.setLessonId(request.lessonId());
                    if (request.description() != null)
                        rule.setDescription(request.description());
                    return ResponseEntity.ok(ruleService.save(rule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ruleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Condition endpoints

    @GetMapping("/{id}/conditions")
    public ResponseEntity<List<RuleCondition>> getConditions(@PathVariable Long id) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ruleService.getConditions(id));
    }

    @PostMapping("/{id}/conditions")
    public ResponseEntity<RuleCondition> addCondition(
            @PathVariable Long id,
            @RequestBody CreateConditionRequest request) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RuleCondition condition = new RuleCondition();
        condition.setTargetPosition(request.targetPosition());
        condition.setConditionType(request.conditionType());
        condition.setConditionValue(request.conditionValue());
        condition.setErrorMessage(request.errorMessage());
        condition.setIsRequired(request.isRequired() != null ? request.isRequired() : true);

        RuleCondition saved = ruleService.addCondition(id, condition);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}/conditions/{conditionId}")
    public ResponseEntity<Void> removeCondition(
            @PathVariable Long id,
            @PathVariable Long conditionId) {
        ruleService.removeCondition(conditionId);
        return ResponseEntity.noContent().build();
    }

    // Test sentence endpoints

    @GetMapping("/{id}/test-sentences")
    public ResponseEntity<List<RuleTestSentence>> getTestSentences(@PathVariable Long id) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ruleService.getTestSentences(id));
    }

    @PostMapping("/{id}/test-sentences")
    public ResponseEntity<RuleTestSentence> addTestSentence(
            @PathVariable Long id,
            @RequestBody CreateTestSentenceRequest request) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RuleTestSentence test = new RuleTestSentence();
        test.setText(request.text());
        test.setExpectedResult(request.expectedResult());

        RuleTestSentence saved = ruleService.addTestSentence(id, test);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}/test-sentences/{testId}")
    public ResponseEntity<Void> removeTestSentence(
            @PathVariable Long id,
            @PathVariable Long testId) {
        ruleService.removeTestSentence(testId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validate-tests")
    public ResponseEntity<List<RuleTestSentence>> validateTests(@PathVariable Long id) {
        if (ruleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ruleService.validateTestSentences(id));
    }
}
