package com.qtihelper.demo.model;

public class AnswerOption {
    private String text;
    private boolean isCorrect;
    private String feedback;
    private String dropdownVariable;

    public AnswerOption(String text, boolean isCorrect) {
        this.text = text;
        this.isCorrect = isCorrect;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getDropdownVariable() { return dropdownVariable; }
    public void setDropdownVariable(String dropdownVariable) { this.dropdownVariable = dropdownVariable; }
}