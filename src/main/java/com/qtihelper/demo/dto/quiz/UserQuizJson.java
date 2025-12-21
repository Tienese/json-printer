package com.qtihelper.demo.dto.quiz;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing the user's custom JSON quiz structure.
 * This is the input format that will be converted to QTI 1.2.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserQuizJson {

    private String title;
    private String description;
    private QuizSettings settings; // Canvas quiz configuration (optional)

    @JsonProperty("questions")
    private List<UserQuestion> questions = new ArrayList<>();

    // Constructors
    public UserQuizJson() {
    }

    public UserQuizJson(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<UserQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<UserQuestion> questions) {
        this.questions = questions;
    }

    /**
     * Returns quiz settings, using defaults if not provided.
     */
    public QuizSettings getSettings() {
        return settings != null ? settings : new QuizSettings();
    }

    public void setSettings(QuizSettings settings) {
        this.settings = settings;
    }

    /**
     * Validates the quiz structure.
     * 
     * @return true if valid, false otherwise
     */
    public boolean isValid() {
        if (title == null || title.isBlank()) {
            return false;
        }
        if (questions == null || questions.isEmpty()) {
            return false;
        }
        // Validate each question
        return questions.stream().allMatch(UserQuestion::isValid);
    }

    @Override
    public String toString() {
        return "UserQuizJson{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", questions=" + questions.size() +
                '}';
    }
}
