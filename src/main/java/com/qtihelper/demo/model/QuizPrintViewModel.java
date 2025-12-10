package com.qtihelper.demo.model;

import java.util.ArrayList;
import java.util.List;

/**
 * View Model for print report template.
 * Separates presentation concerns from business logic and Canvas DTOs.
 *
 * Design: Quiz-centric structure with pre-computed display values.
 * Benefits:
 * - Clean separation between API data and view requirements
 * - Pre-computed visual markers and option letters
 * - No complex logic in Thymeleaf templates
 * - Easy to test and maintain
 */
public class QuizPrintViewModel {

    private String quizTitle;
    private Long quizId;

    private int studentCount;
    private List<StudentQuizView> students = new ArrayList<>();

    // Getters and Setters
    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public int getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(int studentCount) {
        this.studentCount = studentCount;
    }

    public long getQuizId() {
        return quizId;
    }

    public void setQuizId(long quizId) {
        this.quizId = quizId;
    }

    public List<StudentQuizView> getStudents() {
        return students;
    }

    public void setStudents(List<StudentQuizView> students) {
        this.students = students;
    }

    /**
     * Represents a single student's quiz attempt with all questions and answers.
     */
    public static class StudentQuizView {
        private String studentName;
        private String studentId;
        private List<QuestionView> questions = new ArrayList<>();
        private List<Integer> incorrectQuestionNumbers = new ArrayList<>();

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public String getStudentId() {
            return studentId;
        }

        public void setStudentId(String studentId) {
            this.studentId = studentId;
        }

        public List<QuestionView> getQuestions() {
            return questions;
        }

        public void setQuestions(List<QuestionView> questions) {
            this.questions = questions;
        }

        public List<Integer> getIncorrectQuestionNumbers() {
            return incorrectQuestionNumbers;
        }

        public void setIncorrectQuestionNumbers(List<Integer> incorrectQuestionNumbers) {
            this.incorrectQuestionNumbers = incorrectQuestionNumbers;
        }
    }

    /**
     * Represents a single question with options, student answer, and feedback.
     */
    public static class QuestionView {
        private int questionNumber;
        private String questionText;
        private double pointsPossible;
        private String questionType;
        private List<OptionView> options = new ArrayList<>();
        private String studentAnswerText;
        private boolean isCorrect;
        private AnswerStatus answerStatus;
        private String feedbackText;
        private boolean hasOptions;

        public int getQuestionNumber() {
            return questionNumber;
        }

        public void setQuestionNumber(int questionNumber) {
            this.questionNumber = questionNumber;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public double getPointsPossible() {
            return pointsPossible;
        }

        public void setPointsPossible(double pointsPossible) {
            this.pointsPossible = pointsPossible;
        }

        public String getQuestionType() {
            return questionType;
        }

        public void setQuestionType(String questionType) {
            this.questionType = questionType;
        }

        public List<OptionView> getOptions() {
            return options;
        }

        public void setOptions(List<OptionView> options) {
            this.options = options;
        }

        public String getStudentAnswerText() {
            return studentAnswerText;
        }

        public void setStudentAnswerText(String studentAnswerText) {
            this.studentAnswerText = studentAnswerText;
        }

        public boolean isCorrect() {
            return isCorrect;
        }

        public void setCorrect(boolean correct) {
            isCorrect = correct;
        }

        public AnswerStatus getAnswerStatus() {
            return answerStatus;
        }

        public void setAnswerStatus(AnswerStatus answerStatus) {
            this.answerStatus = answerStatus;
        }

        public String getFeedbackText() {
            return feedbackText;
        }

        public void setFeedbackText(String feedbackText) {
            this.feedbackText = feedbackText;
        }

        public boolean isHasOptions() {
            return hasOptions;
        }

        public void setHasOptions(boolean hasOptions) {
            this.hasOptions = hasOptions;
        }
    }

    /**
     * Represents a single answer option with visual markers.
     * Visual markers:
     * - ✓ : Correct answer selected by student
     * - ✗ : Incorrect answer selected by student
     * - ▲ : Correct answer not selected (shown only when question is wrong)
     * - "" : No marker (correct answer not selected on correct questions, or
     * incorrect answer not selected)
     */
    public static class OptionView {
        private String optionLetter;
        private String optionText;
        private boolean isCorrect;
        private boolean isStudentAnswer;
        private String visualMarker;
        private String commentText;

        public String getOptionLetter() {
            return optionLetter;
        }

        public void setOptionLetter(String optionLetter) {
            this.optionLetter = optionLetter;
        }

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public boolean isCorrect() {
            return isCorrect;
        }

        public void setCorrect(boolean correct) {
            isCorrect = correct;
        }

        public boolean isStudentAnswer() {
            return isStudentAnswer;
        }

        public void setStudentAnswer(boolean studentAnswer) {
            isStudentAnswer = studentAnswer;
        }

        public String getVisualMarker() {
            return visualMarker;
        }

        public void setVisualMarker(String visualMarker) {
            this.visualMarker = visualMarker;
        }

        public String getCommentText() {
            return commentText;
        }

        public void setCommentText(String commentText) {
            this.commentText = commentText;
        }
    }
}
