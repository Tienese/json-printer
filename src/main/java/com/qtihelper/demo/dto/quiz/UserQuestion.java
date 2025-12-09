package com.qtihelper.demo.dto.quiz;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing a single question in the user's JSON quiz.
 * Supports: MC (Multiple Choice), MA (Multiple Answer), MD (Multiple Dropdown),
 * MT (Matching), TF (True/False), DD (Dropdown).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserQuestion {

    private String type; // MC, MA, MD, MT, TF, DD
    private String title;
    private String prompt;

    @JsonProperty("points")
    private Double points;

    @JsonProperty("general_feedback")
    @JsonAlias("generalFeedback")
    private String generalFeedback;

    @JsonProperty("correct_feedback")
    @JsonAlias("correctFeedback")
    private String correctFeedback;

    @JsonProperty("incorrect_feedback")
    @JsonAlias("incorrectFeedback")
    private String incorrectFeedback;

    @JsonProperty("answers")
    private List<UserAnswer> answers = new ArrayList<>();

    // For matching questions - left/right pairs
    @JsonProperty("left_column")
    private List<String> leftColumn;

    @JsonProperty("right_column")
    private List<String> rightColumn;

    @JsonProperty("matches")
    private List<MatchPair> matches;

    // Alternative matching question format
    @JsonProperty("matchingPairs")
    @JsonAlias("matching_pairs")
    private List<MatchPair> matchingPairs;

    @JsonProperty("matchingDistractors")
    @JsonAlias("matching_distractors")
    private List<String> matchingDistractors;

    // Constructors
    public UserQuestion() {}

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public Double getPoints() {
        return points;
    }

    public void setPoints(Double points) {
        this.points = points;
    }

    public String getGeneralFeedback() {
        return generalFeedback;
    }

    public void setGeneralFeedback(String generalFeedback) {
        this.generalFeedback = generalFeedback;
    }

    public String getCorrectFeedback() {
        return correctFeedback;
    }

    public void setCorrectFeedback(String correctFeedback) {
        this.correctFeedback = correctFeedback;
    }

    public String getIncorrectFeedback() {
        return incorrectFeedback;
    }

    public void setIncorrectFeedback(String incorrectFeedback) {
        this.incorrectFeedback = incorrectFeedback;
    }

    public List<UserAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<UserAnswer> answers) {
        this.answers = answers;
    }

    public List<String> getLeftColumn() {
        return leftColumn;
    }

    public void setLeftColumn(List<String> leftColumn) {
        this.leftColumn = leftColumn;
    }

    public List<String> getRightColumn() {
        return rightColumn;
    }

    public void setRightColumn(List<String> rightColumn) {
        this.rightColumn = rightColumn;
    }

    public List<MatchPair> getMatches() {
        return matches;
    }

    public void setMatches(List<MatchPair> matches) {
        this.matches = matches;
    }

    public List<MatchPair> getMatchingPairs() {
        return matchingPairs;
    }

    public void setMatchingPairs(List<MatchPair> matchingPairs) {
        this.matchingPairs = matchingPairs;
    }

    public List<String> getMatchingDistractors() {
        return matchingDistractors;
    }

    public void setMatchingDistractors(List<String> matchingDistractors) {
        this.matchingDistractors = matchingDistractors;
    }

    /**
     * Validates the question structure.
     */
    public boolean isValid() {
        if (type == null || type.isBlank()) {
            return false;
        }

        // Validate supported types
        String normalizedType = type.toUpperCase();
        if (!List.of("MC", "MA", "MD", "MT", "TF", "DD").contains(normalizedType)) {
            return false;
        }

        if (prompt == null || prompt.isBlank()) {
            return false;
        }

        if (points == null || points <= 0) {
            return false;
        }

        // For matching questions, validate matching data
        if ("MT".equals(normalizedType)) {
            // Support both formats: matchingPairs or matches
            boolean hasMatchingPairs = matchingPairs != null && !matchingPairs.isEmpty();
            boolean hasMatches = matches != null && !matches.isEmpty();
            boolean hasColumns = (leftColumn != null && !leftColumn.isEmpty())
                              && (rightColumn != null && !rightColumn.isEmpty());

            // At least one format must be present
            if (!hasMatchingPairs && !hasMatches && !hasColumns) {
                return false;
            }
        } else {
            // For non-matching questions, must have answers
            if (answers == null || answers.isEmpty()) {
                return false;
            }
            // At least one correct answer required
            boolean hasCorrect = answers.stream().anyMatch(a -> a.getCorrect() != null && a.getCorrect());
            if (!hasCorrect) {
                return false;
            }
        }

        return true;
    }

    /**
     * Inner class for matching question pairs.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchPair {
        private String left;
        private String right;

        public MatchPair() {}

        public MatchPair(String left, String right) {
            this.left = left;
            this.right = right;
        }

        public String getLeft() {
            return left;
        }

        public void setLeft(String left) {
            this.left = left;
        }

        public String getRight() {
            return right;
        }

        public void setRight(String right) {
            this.right = right;
        }
    }

    @Override
    public String toString() {
        return "UserQuestion{" +
                "type='" + type + '\'' +
                ", title='" + title + '\'' +
                ", points=" + points +
                ", answers=" + answers.size() +
                '}';
    }
}
