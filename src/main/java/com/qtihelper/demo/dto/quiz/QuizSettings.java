package com.qtihelper.demo.dto.quiz;

/**
 * Settings for Canvas quiz configuration.
 * All fields are optional - null values will use Canvas defaults.
 */
public record QuizSettings(
        String quizType, // "assignment" | "practice_quiz" | "graded_survey" | "survey"
        Integer timeLimit, // Minutes, null = unlimited
        Integer allowedAttempts, // -1 = unlimited, positive number = exact count
        String scoringPolicy, // "keep_highest" | "keep_latest" | "keep_average"
        Boolean shuffleAnswers,
        Boolean showCorrectAnswers,
        Boolean oneQuestionAtATime,
        Boolean cantGoBack,
        String dueAt, // ISO 8601 datetime or null
        String lockAt, // ISO 8601 datetime or null
        String unlockAt // ISO 8601 datetime or null
) {
    /**
     * Default constructor with Canvas defaults.
     */
    public QuizSettings() {
        this("assignment", null, 1, "keep_highest", false, true, false, false, null, null, null);
    }

    /**
     * Returns the quiz type, defaulting to "assignment" if null.
     */
    public String quizType() {
        return quizType != null ? quizType : "assignment";
    }

    /**
     * Returns allowed attempts, defaulting to 1 if null.
     */
    public Integer allowedAttempts() {
        return allowedAttempts != null ? allowedAttempts : 1;
    }

    /**
     * Returns scoring policy, defaulting to "keep_highest" if null.
     */
    public String scoringPolicy() {
        return scoringPolicy != null ? scoringPolicy : "keep_highest";
    }

    /**
     * Returns shuffle answers setting, defaulting to false if null.
     */
    public Boolean shuffleAnswers() {
        return shuffleAnswers != null ? shuffleAnswers : false;
    }

    /**
     * Returns show correct answers setting, defaulting to true if null.
     */
    public Boolean showCorrectAnswers() {
        return showCorrectAnswers != null ? showCorrectAnswers : true;
    }

    /**
     * Returns one question at a time setting, defaulting to false if null.
     */
    public Boolean oneQuestionAtATime() {
        return oneQuestionAtATime != null ? oneQuestionAtATime : false;
    }

    /**
     * Returns can't go back setting, defaulting to false if null.
     */
    public Boolean cantGoBack() {
        return cantGoBack != null ? cantGoBack : false;
    }
}
