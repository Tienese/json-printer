package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasAnswerDto;
import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.dto.canvas.CanvasQuizDto;
import com.qtihelper.demo.model.QuizStatistics;
import com.qtihelper.demo.model.QuizStatistics.AnswerStatistics;
import com.qtihelper.demo.model.QuizStatistics.QuestionStatistics;
import com.qtihelper.demo.model.QuizStatistics.SubmissionStatistics;
import com.qtihelper.demo.model.StudentSubmission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for computing quiz statistics using Canvas-accurate formulas.
 */
@Service
public class StatisticsService {

        private static final Logger log = LoggerFactory.getLogger(StatisticsService.class);
        private static final double TOP_PERCENTILE = 0.27;
        private static final double BOTTOM_PERCENTILE = 0.27;

        /**
         * Compute complete quiz statistics from submissions.
         */
        public QuizStatistics computeStatistics(
                        CanvasQuizDto quiz,
                        List<CanvasQuestionDto> questions,
                        List<StudentSubmission> submissions) {

                log.info("Computing statistics for quiz: {} with {} submissions", quiz.title(), submissions.size());

                SubmissionStatistics submissionStats = computeSubmissionStatistics(submissions, questions);
                Map<Integer, QuestionStatistics> questionStats = computeQuestionStatistics(questions, submissions);

                return new QuizStatistics(
                                quiz.id(),
                                quiz.title(),
                                Instant.now(),
                                submissionStats,
                                questionStats);
        }

        /**
         * Compute submission-level statistics.
         */
        private SubmissionStatistics computeSubmissionStatistics(
                        List<StudentSubmission> submissions,
                        List<CanvasQuestionDto> questions) {

                if (submissions.isEmpty()) {
                        return new SubmissionStatistics(0, 0.0, 0.0, 0.0, 0.0, Map.of(), 0.0, 0.0, null);
                }

                // Extract scores
                List<Double> scores = submissions.stream()
                                .map(StudentSubmission::getTotalScore)
                                .filter(Objects::nonNull)
                                .toList();

                if (scores.isEmpty()) {
                        return new SubmissionStatistics(0, 0.0, 0.0, 0.0, 0.0, Map.of(), 0.0, 0.0, null);
                }

                // Basic statistics
                double average = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                double high = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double low = scores.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                double stdev = calculateStandardDeviation(scores, average);

                // Score distribution (percentile -> count)
                Map<Integer, Integer> scoreDistribution = calculateScoreDistribution(scores);

                // Correct/incorrect counts
                double correctAvg = submissions.stream()
                                .mapToInt(s -> countCorrectAnswers(s, questions))
                                .average()
                                .orElse(0.0);

                double incorrectAvg = questions.size() - correctAvg;

                return new SubmissionStatistics(
                                submissions.size(),
                                average,
                                high,
                                low,
                                stdev,
                                scoreDistribution,
                                correctAvg,
                                incorrectAvg,
                                null // Duration not tracked locally
                );
        }

        /**
         * Compute question-level statistics.
         */
        private Map<Integer, QuestionStatistics> computeQuestionStatistics(
                        List<CanvasQuestionDto> questions,
                        List<StudentSubmission> submissions) {

                Map<Integer, QuestionStatistics> stats = new HashMap<>();

                for (int i = 0; i < questions.size(); i++) {
                        CanvasQuestionDto question = questions.get(i);
                        int questionNumber = i + 1;

                        QuestionStatistics questionStat = computeSingleQuestionStatistics(
                                        question, questionNumber, submissions);

                        stats.put(questionNumber, questionStat);
                }

                return stats;
        }

        /**
         * Compute statistics for a single question.
         */
        private QuestionStatistics computeSingleQuestionStatistics(
                        CanvasQuestionDto question,
                        int questionNumber,
                        List<StudentSubmission> submissions) {

                // Get student responses for this question
                List<StudentResponse> responses = getQuestionResponses(questionNumber, submissions, question);

                int totalResponses = responses.size();
                int correctCount = (int) responses.stream().filter(StudentResponse::isCorrect).count();
                int incorrectCount = totalResponses - correctCount;

                double correctRatio = totalResponses > 0 ? (double) correctCount / totalResponses : 0.0;

                // Top/Middle/Bottom groupings
                GroupCounts groups = calculateTopMiddleBottom(responses, submissions);

                // Variance and standard deviation
                double variance = calculateVariance(responses);
                double stdev = Math.sqrt(variance);

                // Answer-level statistics
                Map<String, AnswerStatistics> answerStats = computeAnswerStatistics(
                                question, responses, submissions);

                return new QuestionStatistics(
                                questionNumber,
                                question.questionType(),
                                totalResponses,
                                totalResponses,
                                correctCount,
                                incorrectCount,
                                correctRatio,
                                groups.topCount(),
                                groups.middleCount(),
                                groups.bottomCount(),
                                groups.correctTopCount(),
                                groups.correctMiddleCount(),
                                groups.correctBottomCount(),
                                variance,
                                stdev,
                                correctRatio, // difficulty_index
                                calculateCronbachAlpha(submissions, questionNumber),
                                answerStats);
        }

        /**
         * Compute answer-level statistics including point-biserial.
         */
        private Map<String, AnswerStatistics> computeAnswerStatistics(
                        CanvasQuestionDto question,
                        List<StudentResponse> responses,
                        List<StudentSubmission> submissions) {

                if (question.answers() == null) {
                        return Map.of();
                }

                Map<String, AnswerStatistics> stats = new HashMap<>();

                for (CanvasAnswerDto answer : question.answers()) {
                        String answerId = String.valueOf(answer.id());

                        int responseCount = (int) responses.stream()
                                        .filter(r -> answerId.equals(r.selectedAnswer()))
                                        .count();

                        Double pointBiserial = calculatePointBiserial(
                                        answer, responses, submissions);

                        stats.put(answerId, new AnswerStatistics(
                                        answerId,
                                        answer.text(),
                                        responseCount,
                                        answer.isCorrect(),
                                        pointBiserial));
                }

                return stats;
        }

        /**
         * Calculate point-biserial correlation.
         * Formula: r_pb = (M₁ - M₀) / σ × √(p × q)
         */
        private Double calculatePointBiserial(
                        CanvasAnswerDto answer,
                        List<StudentResponse> responses,
                        List<StudentSubmission> submissions) {

                if (responses.size() < 2) {
                        return null;
                }

                // Get total scores for students who selected this answer
                List<Double> scoresSelected = responses.stream()
                                .filter(r -> String.valueOf(answer.id()).equals(r.selectedAnswer()))
                                .map(r -> getStudentTotalScore(r.studentId(), submissions))
                                .filter(Objects::nonNull)
                                .toList();

                // Get total scores for students who didn't select this answer
                List<Double> scoresNotSelected = responses.stream()
                                .filter(r -> !String.valueOf(answer.id()).equals(r.selectedAnswer()))
                                .map(r -> getStudentTotalScore(r.studentId(), submissions))
                                .filter(Objects::nonNull)
                                .toList();

                if (scoresSelected.isEmpty() || scoresNotSelected.isEmpty()) {
                        return null;
                }

                double m1 = scoresSelected.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                double m0 = scoresNotSelected.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

                // Overall standard deviation
                List<Double> allScores = submissions.stream()
                                .map(StudentSubmission::getTotalScore)
                                .filter(Objects::nonNull)
                                .toList();

                double mean = allScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                double sigma = calculateStandardDeviation(allScores, mean);

                if (sigma == 0) {
                        return null;
                }

                // Proportion who selected this answer
                double p = (double) scoresSelected.size() / responses.size();
                double q = 1.0 - p;

                // Point-biserial formula
                return ((m1 - m0) / sigma) * Math.sqrt(p * q);
        }

        /**
         * Calculate standard deviation.
         */
        private double calculateStandardDeviation(List<Double> values, double mean) {
                if (values.size() < 2) {
                        return 0.0;
                }

                double sumSquaredDiff = values.stream()
                                .mapToDouble(v -> Math.pow(v - mean, 2))
                                .sum();

                return Math.sqrt(sumSquaredDiff / values.size());
        }

        /**
         * Calculate score distribution as percentile buckets.
         */
        private Map<Integer, Integer> calculateScoreDistribution(List<Double> scores) {
                return scores.stream()
                                .map(Double::intValue)
                                .collect(Collectors.groupingBy(
                                                score -> score,
                                                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        }

        /**
         * Group students into top 27%, middle 46%, bottom 27%.
         */
        private GroupCounts calculateTopMiddleBottom(
                        List<StudentResponse> responses,
                        List<StudentSubmission> submissions) {

                // Sort students by total score
                List<StudentSubmission> sorted = submissions.stream()
                                .sorted(Comparator.comparing(StudentSubmission::getTotalScore,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();

                int total = sorted.size();
                int topCutoff = (int) Math.ceil(total * TOP_PERCENTILE);
                int bottomCutoff = (int) Math.ceil(total * BOTTOM_PERCENTILE);

                Set<String> topStudents = sorted.stream()
                                .limit(topCutoff)
                                .map(StudentSubmission::getStudentId)
                                .collect(Collectors.toSet());

                Set<String> bottomStudents = sorted.stream()
                                .skip(Math.max(0, total - bottomCutoff))
                                .map(StudentSubmission::getStudentId)
                                .collect(Collectors.toSet());

                int topCount = topStudents.size();
                int bottomCount = bottomStudents.size();
                int middleCount = total - topCount - bottomCount;

                int correctTopCount = (int) responses.stream()
                                .filter(r -> topStudents.contains(r.studentId()) && r.isCorrect())
                                .count();

                int correctBottomCount = (int) responses.stream()
                                .filter(r -> bottomStudents.contains(r.studentId()) && r.isCorrect())
                                .count();

                int correctMiddleCount = (int) responses.stream()
                                .filter(r -> !topStudents.contains(r.studentId())
                                                && !bottomStudents.contains(r.studentId())
                                                && r.isCorrect())
                                .count();

                return new GroupCounts(
                                topCount, middleCount, bottomCount,
                                correctTopCount, correctMiddleCount, correctBottomCount);
        }

        private record GroupCounts(
                        int topCount, int middleCount, int bottomCount,
                        int correctTopCount, int correctMiddleCount, int correctBottomCount) {
        }

        private record StudentResponse(
                        String studentId,
                        String selectedAnswer,
                        boolean isCorrect) {
        }

        // Helper methods

        private List<StudentResponse> getQuestionResponses(
                        int questionNumber,
                        List<StudentSubmission> submissions,
                        CanvasQuestionDto question) {

                List<StudentResponse> responses = new ArrayList<>();

                for (StudentSubmission submission : submissions) {
                        String studentAnswer = submission.getResponses().get(questionNumber);
                        if (studentAnswer == null || studentAnswer.trim().isEmpty()) {
                                continue; // Skip if no answer provided
                        }

                        boolean isCorrect = isAnswerCorrect(studentAnswer, question);
                        responses.add(new StudentResponse(
                                        submission.getStudentId(),
                                        studentAnswer,
                                        isCorrect));
                }

                return responses;
        }

        private int countCorrectAnswers(StudentSubmission submission, List<CanvasQuestionDto> questions) {
                int correctCount = 0;

                for (int i = 0; i < questions.size(); i++) {
                        int questionNumber = i + 1;
                        String studentAnswer = submission.getResponses().get(questionNumber);

                        if (studentAnswer != null && isAnswerCorrect(studentAnswer, questions.get(i))) {
                                correctCount++;
                        }
                }

                return correctCount;
        }

        /**
         * Check if a student's answer is correct for a given question.
         */
        private boolean isAnswerCorrect(String studentAnswer, CanvasQuestionDto question) {
                if (question.answers() == null || studentAnswer == null) {
                        return false;
                }

                // For multiple choice/true-false: match answer ID or text
                return question.answers().stream()
                                .filter(answer -> answer.isCorrect())
                                .anyMatch(answer -> String.valueOf(answer.id()).equals(studentAnswer.trim()) ||
                                                answer.text().equalsIgnoreCase(studentAnswer.trim()));
        }

        private Double getStudentTotalScore(String studentId, List<StudentSubmission> submissions) {
                return submissions.stream()
                                .filter(s -> studentId.equals(s.getStudentId()))
                                .map(StudentSubmission::getTotalScore)
                                .findFirst()
                                .orElse(null);
        }

        private double calculateVariance(List<StudentResponse> responses) {
                // Variance of binary outcomes (correct/incorrect)
                if (responses.isEmpty()) {
                        return 0.0;
                }

                double p = responses.stream().filter(StudentResponse::isCorrect).count() / (double) responses.size();
                return p * (1 - p);
        }

        private Double calculateCronbachAlpha(List<StudentSubmission> submissions, int questionNumber) {
                // Cronbach's alpha requires n > 15
                if (submissions.size() <= 15) {
                        return null;
                }

                // TODO: Implement Cronbach's alpha calculation
                return null;
        }
}
