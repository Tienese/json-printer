package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Grammar rule entity for V4.0 validation engine.
 * Named V4 to avoid conflict with existing GrammarRule entity.
 * 
 * Responsibility: Define grammar rules with particle/pattern matching
 * Dependencies: RuleCondition, RuleTestSentence entities
 */
@Entity
@Table(name = "grammar_rules_v4")
public class GrammarRuleV4 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "rule_type", nullable = false, length = 20)
    private String ruleType; // PARTICLE, PATTERN, VERB_PARTICLE

    @Column(length = 10)
    private String particle;

    @Column(length = 50)
    private String pattern;

    @Column(name = "lesson_id")
    private Integer lessonId;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "parent_rule_id")
    private Long parentRuleId; // V5.0 hook

    @Column
    private Integer priority = 0; // V5.0 hook

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getParticle() {
        return particle;
    }

    public void setParticle(String particle) {
        this.particle = particle;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public Integer getLessonId() {
        return lessonId;
    }

    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Long getParentRuleId() {
        return parentRuleId;
    }

    public void setParentRuleId(Long parentRuleId) {
        this.parentRuleId = parentRuleId;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
