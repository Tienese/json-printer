package com.qtihelper.demo.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Question {
    private String title = "Untitled Question";
    private final StringBuilder prompt = new StringBuilder();
    private QuestionType type;
    private double points = 1.0;

    private String generalFeedback;
    private String correctFeedback;
    private String incorrectFeedback;

    private final List<AnswerOption> answers = new ArrayList<>();
    private final Map<String, String> matchingPairs = new HashMap<>();
    private final List<String> matchingDistractors = new ArrayList<>();

    public void setTitle(String title) {
        this.title = (title == null || title.isBlank()) ? "Untitled Question" : title;
    }

    public void setTypeFromCode(String code) {
        this.type = QuestionType.fromCode(code);
    }

    public void setPoints(double points) {
        if (points < 0) throw new IllegalArgumentException("Points cannot be negative: " + points);
        this.points = points;
    }

    public void setGeneralFeedback(String fb) { this.generalFeedback = fb; }
    public void setCorrectFeedback(String fb) { this.correctFeedback = fb; }
    public void setIncorrectFeedback(String fb) { this.incorrectFeedback = fb; }

    public void appendPromptLine(String text) {
        if (text == null || text.isBlank()) return;
        String trimmedText = text.strip();
        if (this.prompt.length() > 0 && this.prompt.charAt(this.prompt.length() - 1) != '\n') {
            this.prompt.append("\n");
        }
        this.prompt.append(trimmedText);
    }

    public void addAnswer(AnswerOption option) {
        if (option != null) this.answers.add(option);
    }

    public void addMatchingPair(String left, String right) {
        if (left != null && right != null) this.matchingPairs.put(left, right);
    }

    public void addMatchingDistractor(String distractor) {
        if (distractor != null && !distractor.isBlank()) this.matchingDistractors.add(distractor);
    }

    // Getters
    public String getTitle() { return title; }
    public String getPromptText() { return prompt.toString().strip(); }
    public QuestionType getType() { return type; }
    public double getPoints() { return points; }
    public String getGeneralFeedback() { return generalFeedback; }
    public String getCorrectFeedback() { return correctFeedback; }
    public String getIncorrectFeedback() { return incorrectFeedback; }
    public List<AnswerOption> getAnswers() { return answers; }
    public Map<String, String> getMatchingPairs() { return matchingPairs; }
    public List<String> getMatchingDistractors() { return matchingDistractors; }
}