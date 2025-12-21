package com.qtihelper.demo.model;

import java.time.Instant;
import java.util.Map;

/**
 * Quiz statistics model matching Canvas API structure.
 * Provides aggregate metrics for quiz submissions.
 */
public record QuizStatistics(
        Long quizId,
        String quizTitle,
        Instant generatedAt,

        // Submission statistics
        SubmissionStatistics submissionStatistics,

        // Question-level statistics
        Map<Integer, QuestionStatistics> questionStatistics) {

    /**
     * Aggregate submission statistics for the quiz.
     */
    public record SubmissionStatistics(
            int uniqueCount, // Number of students
            double scoreAverage, // Mean score
            double scoreHigh, // Highest score
            double scoreLow, // Lowest score
            double scoreStdev, // Standard deviation
            Map<Integer, Integer> scores, // Score distribution (score -> count)
            double correctCountAverage, // Avg correct answers per student
            double incorrectCountAverage, // Avg incorrect answers per student
            Double durationAverage // Avg time spent (optional)
    ) {
    }

    /**
     * Statistics for a single question.
     */
    public record QuestionStatistics(
            int questionNumber,
            String questionType,
            int responses, // Students who answered
            int answeredStudentCount,
            int correctStudentCount,
            int incorrectStudentCount,
            double correctStudentRatio, // difficulty_index

            // Top/Middle/Bottom 27% groupings
            int topStudentCount,
            int middleStudentCount,
            int bottomStudentCount,
            int correctTopStudentCount,
            int correctMiddleStudentCount,
            int correctBottomStudentCount,

            // Statistical measures
            double variance,
            double stdev,
            double difficultyIndex, // Ratio of correct answers
            Double alpha, // Cronbach's alpha (if n > 15)

            // Answer-level statistics
            Map<String, AnswerStatistics> answerStatistics) {
        /**
         * Discrimination index: difference between top and bottom 27%.
         */
        public double discriminationIndex() {
            if (topStudentCount == 0 || bottomStudentCount == 0) {
                return 0.0;
            }
            double topCorrectRatio = (double) correctTopStudentCount / topStudentCount;
            double bottomCorrectRatio = (double) correctBottomStudentCount / bottomStudentCount;
            return topCorrectRatio - bottomCorrectRatio;
        }
    }

    /**
     * Statistics for a single answer option.
     */
    public record AnswerStatistics(
            String answerId,
            String text,
            int responses,
            boolean correct,
            Double pointBiserial // Correlation with total score
    ) {
    }
}
