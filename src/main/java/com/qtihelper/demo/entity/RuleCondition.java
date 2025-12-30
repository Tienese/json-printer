package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Condition for a grammar rule in V4.0 validation engine.
 * 
 * Responsibility: Define conditions that must be met for a rule
 * Dependencies: GrammarRuleV4 entity
 */
@Entity
@Table(name = "rule_conditions")
public class RuleCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @Column(name = "condition_order", nullable = false)
    private Integer conditionOrder;

    @Column(name = "target_position", nullable = false, length = 30)
    private String targetPosition; // BEFORE, AFTER, OBJECT, SUBJECT, VERB, ANY

    @Column(name = "condition_type", nullable = false, length = 30)
    private String conditionType; // HAS_TAG, NOT_HAS_TAG, IS_VERB, VERB_FORM, IS_POS, MATCHES

    @Column(name = "condition_value", nullable = false, length = 100)
    private String conditionValue;

    @Column(name = "error_message", length = 200)
    private String errorMessage;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;

    @Column(name = "is_negated")
    private Boolean isNegated = false; // V5.0 hook

    @Column(name = "target_slot", length = 30)
    private String targetSlot; // V5.0 hook

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public Integer getConditionOrder() {
        return conditionOrder;
    }

    public void setConditionOrder(Integer conditionOrder) {
        this.conditionOrder = conditionOrder;
    }

    public String getTargetPosition() {
        return targetPosition;
    }

    public void setTargetPosition(String targetPosition) {
        this.targetPosition = targetPosition;
    }

    public String getConditionType() {
        return conditionType;
    }

    public void setConditionType(String conditionType) {
        this.conditionType = conditionType;
    }

    public String getConditionValue() {
        return conditionValue;
    }

    public void setConditionValue(String conditionValue) {
        this.conditionValue = conditionValue;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public Boolean getIsNegated() {
        return isNegated;
    }

    public void setIsNegated(Boolean isNegated) {
        this.isNegated = isNegated;
    }

    public String getTargetSlot() {
        return targetSlot;
    }

    public void setTargetSlot(String targetSlot) {
        this.targetSlot = targetSlot;
    }
}
