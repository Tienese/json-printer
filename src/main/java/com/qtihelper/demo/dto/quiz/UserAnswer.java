package com.qtihelper.demo.dto.quiz;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing a single answer option in a question.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserAnswer {

    private String text;

    @JsonProperty("correct")
    private Boolean correct;

    @JsonProperty("feedback")
    private String feedback;

    // For dropdown questions - the blank/slot identifier
    @JsonProperty("blank_id")
    private String blankId;

    // Alternative dropdown property name
    @JsonProperty("dropdownVariable")
    private String dropdownVariable;

    // Constructors
    public UserAnswer() {}

    public UserAnswer(String text, Boolean correct) {
        this.text = text;
        this.correct = correct;
    }

    public UserAnswer(String text, Boolean correct, String feedback) {
        this.text = text;
        this.correct = correct;
        this.feedback = feedback;
    }

    // Getters and Setters
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getBlankId() {
        return blankId;
    }

    public void setBlankId(String blankId) {
        this.blankId = blankId;
    }

    public String getDropdownVariable() {
        return dropdownVariable;
    }

    public void setDropdownVariable(String dropdownVariable) {
        this.dropdownVariable = dropdownVariable;
    }

    @Override
    public String toString() {
        return "UserAnswer{" +
                "text='" + text + '\'' +
                ", correct=" + correct +
                '}';
    }
}
