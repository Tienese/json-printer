package com.qtihelper.demo.service;

import com.qtihelper.demo.entity.GrammarRule;
import com.qtihelper.demo.entity.RuleSuggestion;
import com.qtihelper.demo.repository.GrammarRuleRepository;
import com.qtihelper.demo.repository.RuleSuggestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing grammar rules.
 * Provides CRUD operations and rule evaluation for the Language Coach.
 */
@Service
public class GrammarRuleService {

    private final GrammarRuleRepository ruleRepository;
    private final RuleSuggestionRepository suggestionRepository;

    public GrammarRuleService(GrammarRuleRepository ruleRepository, RuleSuggestionRepository suggestionRepository) {
        this.ruleRepository = ruleRepository;
        this.suggestionRepository = suggestionRepository;
    }

    /**
     * Get all enabled rules, ordered by priority.
     */
    public List<GrammarRule> getEnabledRules() {
        return ruleRepository.findByEnabledTrueOrderByPriorityDesc();
    }

    /**
     * Get all rules (enabled and disabled).
     */
    public List<GrammarRule> getAllRules() {
        return ruleRepository.findAll();
    }

    /**
     * Get a rule by ID.
     */
    public Optional<GrammarRule> getRuleById(Long id) {
        return ruleRepository.findById(id);
    }

    /**
     * Create a new grammar rule.
     */
    @Transactional
    public GrammarRule createRule(String name, GrammarRule.RuleType ruleType, String suggestionText,
            Long targetTagId, String targetWord, Integer threshold, Integer priority) {
        GrammarRule rule = new GrammarRule(name, ruleType, suggestionText);
        rule.setTargetWord(targetWord);
        rule.setThreshold(threshold);
        rule.setPriority(priority != null ? priority : 0);
        rule.setEnabled(true);
        // Note: targetTag would need to be fetched and set if targetTagId is provided
        return ruleRepository.save(rule);
    }

    /**
     * Update an existing rule.
     */
    @Transactional
    public GrammarRule updateRule(Long id, String name, GrammarRule.RuleType ruleType, String suggestionText,
            String targetWord, Integer threshold, Integer priority, Boolean enabled) {
        GrammarRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found: " + id));

        rule.setName(name);
        rule.setRuleType(ruleType);
        rule.setSuggestionText(suggestionText);
        rule.setTargetWord(targetWord);
        rule.setThreshold(threshold);
        if (priority != null)
            rule.setPriority(priority);
        if (enabled != null)
            rule.setEnabled(enabled);

        return ruleRepository.save(rule);
    }

    /**
     * Delete a rule and its suggestions.
     */
    @Transactional
    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new IllegalArgumentException("Rule not found: " + id);
        }
        suggestionRepository.deleteByRuleId(id);
        ruleRepository.deleteById(id);
    }

    /**
     * Add a suggestion to a rule.
     */
    @Transactional
    public RuleSuggestion addSuggestion(Long ruleId, String suggestedWord, String context, Integer priority) {
        GrammarRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found: " + ruleId));

        RuleSuggestion suggestion = new RuleSuggestion(rule, suggestedWord, priority != null ? priority : 0);
        suggestion.setContext(context);
        return suggestionRepository.save(suggestion);
    }

    /**
     * Get suggestions for a rule.
     */
    public List<RuleSuggestion> getSuggestionsForRule(Long ruleId) {
        return suggestionRepository.findByRuleIdOrderByPriorityDesc(ruleId);
    }

    /**
     * Seed default N5-level grammar rules.
     */
    @Transactional
    public void seedDefaultRules() {
        // Rule: Pronoun overuse (わたし)
        if (ruleRepository.findByTargetWord("わたし").isEmpty()) {
            GrammarRule rule = new GrammarRule(
                    "pronoun_watashi_overuse",
                    GrammarRule.RuleType.OVERUSE,
                    "Consider varying your pronoun usage. Too many 'わたし'.");
            rule.setTargetWord("わたし");
            rule.setThreshold(3);
            rule.setPriority(10);
            GrammarRule saved = ruleRepository.save(rule);

            // Add suggestions
            suggestionRepository.save(new RuleSuggestion(saved, "私", 3));
            suggestionRepository.save(new RuleSuggestion(saved, "僕", 2));
            suggestionRepository.save(new RuleSuggestion(saved, "俺", 1));
        }

        // Rule: Honorific overuse (さん)
        if (ruleRepository.findByTargetWord("さん").isEmpty()) {
            GrammarRule rule = new GrammarRule(
                    "honorific_san_overuse",
                    GrammarRule.RuleType.OVERUSE,
                    "Consider varying your honorific usage. Too many 'さん'.");
            rule.setTargetWord("さん");
            rule.setThreshold(5);
            rule.setPriority(8);
            GrammarRule saved = ruleRepository.save(rule);

            suggestionRepository.save(new RuleSuggestion(saved, "くん", 2));
            suggestionRepository.save(new RuleSuggestion(saved, "ちゃん", 1));
        }
    }
}
