package com.qtihelper.demo.model;

import java.util.HashMap;
import java.util.Map;

public class StudentSubmission {
    private String firstName;
    private String lastName;
    private String studentId;
    private String quizName;
    private String exportTimestamp;

    // Map: question position (1-based) -> student answer
    private Map<Integer, String> responses = new HashMap<>();

    // Total score for this submission
    private Double totalScore;

    // Getters & Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getQuizName() {
        return quizName;
    }

    public void setQuizName(String quizName) {
        this.quizName = quizName;
    }

    public String getExportTimestamp() {
        return exportTimestamp;
    }

    public void setExportTimestamp(String exportTimestamp) {
        this.exportTimestamp = exportTimestamp;
    }

    public Map<Integer, String> getResponses() {
        return responses;
    }

    public void setResponses(Map<Integer, String> responses) {
        this.responses = responses;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
