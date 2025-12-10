package com.qtihelper.demo.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for receiving edited print report data from client.
 * Used when users edit student names, answers, or question content
 * in the print report view and save changes.
 */
public class PrintReportEditDto {

    private List<StudentEdit> students = new ArrayList<>();

    public List<StudentEdit> getStudents() {
        return students;
    }

    public void setStudents(List<StudentEdit> students) {
        this.students = students;
    }

    /**
     * Represents edited data for a single student
     */
    public static class StudentEdit {
        private String studentName;
        private String studentId;
        private List<QuestionEdit> questions = new ArrayList<>();

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

        public List<QuestionEdit> getQuestions() {
            return questions;
        }

        public void setQuestions(List<QuestionEdit> questions) {
            this.questions = questions;
        }
    }

    /**
     * Represents edited data for a single question
     */
    public static class QuestionEdit {
        private String questionText;
        private List<OptionEdit> options = new ArrayList<>();
        private String feedback;
        private String studentAnswerText; // For essay-type questions

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public List<OptionEdit> getOptions() {
            return options;
        }

        public void setOptions(List<OptionEdit> options) {
            this.options = options;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }

        public String getStudentAnswerText() {
            return studentAnswerText;
        }

        public void setStudentAnswerText(String studentAnswerText) {
            this.studentAnswerText = studentAnswerText;
        }
    }

    /**
     * Represents edited data for a single answer option
     */
    public static class OptionEdit {
        private String optionText;
        private boolean isSelected; // Whether student selected this option
        private String comment;

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public boolean isSelected() {
            return isSelected;
        }

        public void setSelected(boolean selected) {
            isSelected = selected;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }
}
