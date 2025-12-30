package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Test sentence for validating grammar rules.
 * 
 * Responsibility: Store test cases for grammar rules
 * Dependencies: GrammarRuleV4 entity
 */
@Entity
@Table(name = "rule_test_sentences")
public class RuleTestSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "expected_result", nullable = false, length = 10)
    private String expectedResult; // PASS, FAIL

    @Column(name = "actual_result", length = 10)
    private String actualResult;

    @Column(name = "result_matches")
    private Boolean resultMatches;

    @Column(name = "sentence_id")
    private Long sentenceId; // V5.0 hook

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

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public String getActualResult() {
        return actualResult;
    }

    public void setActualResult(String actualResult) {
        this.actualResult = actualResult;
    }

    public Boolean getResultMatches() {
        return resultMatches;
    }

    public void setResultMatches(Boolean resultMatches) {
        this.resultMatches = resultMatches;
    }

    public Long getSentenceId() {
        return sentenceId;
    }

    public void setSentenceId(Long sentenceId) {
        this.sentenceId = sentenceId;
    }
}
