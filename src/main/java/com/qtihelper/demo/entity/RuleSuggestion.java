package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Suggestion linked to a grammar rule.
 * When a rule is triggered, these suggestions are offered to the user.
 */
@Entity
@Table(name = "rule_suggestion")
public class RuleSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private GrammarRule rule;

    @Column(nullable = false)
    private String suggestedWord; // Word to suggest

    @Column
    private String context; // When to use this suggestion (e.g., "casual", "formal")

    @Column
    private Integer priority = 0; // Higher = shown first

    // Constructors
    public RuleSuggestion() {
    }

    public RuleSuggestion(GrammarRule rule, String suggestedWord, Integer priority) {
        this.rule = rule;
        this.suggestedWord = suggestedWord;
        this.priority = priority;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GrammarRule getRule() {
        return rule;
    }

    public void setRule(GrammarRule rule) {
        this.rule = rule;
    }

    public String getSuggestedWord() {
        return suggestedWord;
    }

    public void setSuggestedWord(String suggestedWord) {
        this.suggestedWord = suggestedWord;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
