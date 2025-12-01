package com.qtihelper.demo.model;

import java.util.ArrayList;
import java.util.List;

public class Quiz {
    private String title = "Untitled Quiz";
    private String description = "";
    private List<Question> questions = new ArrayList<>();

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public void addQuestion(Question q) { this.questions.add(q); }
}