package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.GrammarAnalysisResult;
import com.qtihelper.demo.entity.GrammarRule;
import com.qtihelper.demo.entity.Worksheet;
import com.qtihelper.demo.repository.WorksheetRepository;
import com.qtihelper.demo.service.GrammarAnalysisService;
import com.qtihelper.demo.service.GrammarRuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for grammar analysis and rule management.
 * Powers the Grammar Coach panel in the worksheet builder.
 */
@RestController
@RequestMapping("/api")
public class GrammarRuleController {

    private final GrammarRuleService ruleService;
    private final GrammarAnalysisService analysisService;
    private final WorksheetRepository worksheetRepository;

    public GrammarRuleController(
            GrammarRuleService ruleService,
            GrammarAnalysisService analysisService,
            WorksheetRepository worksheetRepository) {
        this.ruleService = ruleService;
        this.analysisService = analysisService;
        this.worksheetRepository = worksheetRepository;
    }

    // ==================== Analysis Endpoints ====================

    /**
     * Analyze worksheet grammar.
     * POST /api/worksheets/{id}/analyze-grammar
     */
    @PostMapping("/worksheets/{id}/analyze-grammar")
    public ResponseEntity<GrammarAnalysisResult> analyzeWorksheet(@PathVariable Long id) {
        Worksheet worksheet = worksheetRepository.findById(id).orElse(null);
        if (worksheet == null) {
            return ResponseEntity.notFound().build();
        }

        GrammarAnalysisResult result = analysisService.analyze(worksheet.getJsonContent());
        return ResponseEntity.ok(result);
    }

    /**
     * Analyze arbitrary JSON (for preview mode without saving).
     * POST /api/grammar/analyze
     */
    @PostMapping("/grammar/analyze")
    public ResponseEntity<GrammarAnalysisResult> analyzeJson(@RequestBody AnalyzeRequest request) {
        GrammarAnalysisResult result = analysisService.analyze(request.worksheetJson());
        return ResponseEntity.ok(result);
    }

    // ==================== Rule Management Endpoints ====================

    /**
     * Get all grammar rules.
     */
    @GetMapping("/grammar-rules")
    public List<GrammarRule> getAllRules() {
        return ruleService.getAllRules();
    }

    /**
     * Get a single rule by ID.
     */
    @GetMapping("/grammar-rules/{id}")
    public ResponseEntity<GrammarRule> getRuleById(@PathVariable Long id) {
        return ruleService.getRuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new grammar rule.
     */
    @PostMapping("/grammar-rules")
    public ResponseEntity<GrammarRule> createRule(@RequestBody CreateRuleRequest request) {
        try {
            GrammarRule rule = ruleService.createRule(
                    request.name(),
                    request.ruleType(),
                    request.suggestionText(),
                    request.targetTagId(),
                    request.targetWord(),
                    request.threshold(),
                    request.priority());
            return ResponseEntity.ok(rule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a grammar rule.
     */
    @PutMapping("/grammar-rules/{id}")
    public ResponseEntity<GrammarRule> updateRule(@PathVariable Long id, @RequestBody UpdateRuleRequest request) {
        try {
            GrammarRule rule = ruleService.updateRule(
                    id,
                    request.name(),
                    request.ruleType(),
                    request.suggestionText(),
                    request.targetWord(),
                    request.threshold(),
                    request.priority(),
                    request.enabled());
            return ResponseEntity.ok(rule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a grammar rule.
     */
    @DeleteMapping("/grammar-rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        try {
            ruleService.deleteRule(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Seed default N5 grammar rules.
     */
    @PostMapping("/grammar-rules/seed-defaults")
    public ResponseEntity<Void> seedDefaults() {
        ruleService.seedDefaultRules();
        return ResponseEntity.ok().build();
    }

    // ==================== Request DTOs ====================

    public record AnalyzeRequest(String worksheetJson) {
    }

    public record CreateRuleRequest(
            String name,
            GrammarRule.RuleType ruleType,
            String suggestionText,
            Long targetTagId,
            String targetWord,
            Integer threshold,
            Integer priority) {
    }

    public record UpdateRuleRequest(
            String name,
            GrammarRule.RuleType ruleType,
            String suggestionText,
            String targetWord,
            Integer threshold,
            Integer priority,
            Boolean enabled) {
    }
}
