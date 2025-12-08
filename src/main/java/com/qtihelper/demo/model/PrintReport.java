package com.qtihelper.demo.model;

import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import java.util.ArrayList;
import java.util.List;

public class PrintReport {
    private String quizTitle;
    private List<StudentReport> studentReports = new ArrayList<>();
    
    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }
    
    public List<StudentReport> getStudentReports() { return studentReports; }
    public void setStudentReports(List<StudentReport> studentReports) { 
        this.studentReports = studentReports; 
    }
    
    public static class StudentReport {
        private StudentSubmission student;
        private List<QuestionResult> questionResults = new ArrayList<>();
        
        public StudentSubmission getStudent() { return student; }
        public void setStudent(StudentSubmission student) { this.student = student; }
        
        public List<QuestionResult> getQuestionResults() { return questionResults; }
        public void setQuestionResults(List<QuestionResult> results) { 
            this.questionResults = results; 
        }
    }
    
    public static class QuestionResult {
        private CanvasQuestionDto question;
        private String studentAnswer;
        private boolean isCorrect;
        private List<String> correctAnswers = new ArrayList<>();
        private String feedbackToShow;
        
        public CanvasQuestionDto getQuestion() { return question; }
        public void setQuestion(CanvasQuestionDto question) { this.question = question; }
        
        public String getStudentAnswer() { return studentAnswer; }
        public void setStudentAnswer(String answer) { this.studentAnswer = answer; }
        
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        
        public List<String> getCorrectAnswers() { return correctAnswers; }
        public void setCorrectAnswers(List<String> answers) { this.correctAnswers = answers; }
        
        public String getFeedbackToShow() { return feedbackToShow; }
        public void setFeedbackToShow(String feedback) { this.feedbackToShow = feedback; }
    }
}
