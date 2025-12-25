package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Database-driven grammar rule for the Language Coach.
 * Rules can detect overuse, missing patterns, and suggest replacements.
 * 
 * Rule types:
 * - OVERUSE: Word/tag used more than threshold times
 * - MISSING: Required tag/pattern not found
 * - REQUIRES: When using X, you should also use Y
 */
@Entity
@Table(name = "grammar_rule")
public class GrammarRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "honorific_variety", "pronoun_overuse"

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RuleType ruleType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_tag_id")
    private VocabTag targetTag; // Which tag this rule applies to (nullable for word-specific rules)

    @Column
    private String targetWord; // Specific word to check (nullable for tag-based rules)

    @Column
    private Integer threshold; // For OVERUSE: max allowed count

    @Column(length = 500)
    private String suggestionText; // Human-readable suggestion message

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column
    private Integer priority = 0; // Higher = more important

    public enum RuleType {
        OVERUSE, // "Too many X"
        MISSING, // "You should include X"
        REQUIRES // "When using X, add Y"
    }

    // Constructors
    public GrammarRule() {
    }

    public GrammarRule(String name, RuleType ruleType, String suggestionText) {
        this.name = name;
        this.ruleType = ruleType;
        this.suggestionText = suggestionText;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(RuleType ruleType) {
        this.ruleType = ruleType;
    }

    public VocabTag getTargetTag() {
        return targetTag;
    }

    public void setTargetTag(VocabTag targetTag) {
        this.targetTag = targetTag;
    }

    public String getTargetWord() {
        return targetWord;
    }

    public void setTargetWord(String targetWord) {
        this.targetWord = targetWord;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public String getSuggestionText() {
        return suggestionText;
    }

    public void setSuggestionText(String suggestionText) {
        this.suggestionText = suggestionText;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
