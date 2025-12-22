package com.qtihelper.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "answers")
public class Answer {

    @Id
    @Column(nullable = false)
    private Long id; // Canvas ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(columnDefinition = "TEXT")
    private String html;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private Integer weight;

    @Column(name = "blank_id")
    private String blankId;

    // Constructors
    public Answer() {}

    public Answer(Long id, String text, Integer weight, String comments) {
        this.id = id;
        this.text = text;
        this.weight = weight;
        this.comments = comments;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getHtml() {
        return html;
    }

    public void setHtml(String html) {
        this.html = html;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getBlankId() {
        return blankId;
    }

    public void setBlankId(String blankId) {
        this.blankId = blankId;
    }
}
