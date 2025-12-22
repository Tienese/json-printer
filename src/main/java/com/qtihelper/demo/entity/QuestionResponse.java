package com.qtihelper.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "question_responses")
public class QuestionResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    // Use question ID or reference. Since we are persisting questions, we can link to Question entity.
    // However, if the question version changes, we might want to store just the question ID or text.
    // For a relational DB foundation, linking to Question is better for integrity.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    // In case we can't link to a question (e.g. deleted), we might want to store the original ID or number.
    @Column(name = "original_question_id")
    private Long originalQuestionId;

    @Column(name = "question_number")
    private Integer questionNumber; // From CSV (1, 2, 3...)

    @Column(name = "response_text", columnDefinition = "TEXT")
    private String responseText;

    // Constructors
    public QuestionResponse() {}

    public QuestionResponse(Integer questionNumber, String responseText) {
        this.questionNumber = questionNumber;
        this.responseText = responseText;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public void setSubmission(Submission submission) {
        this.submission = submission;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public Long getOriginalQuestionId() {
        return originalQuestionId;
    }

    public void setOriginalQuestionId(Long originalQuestionId) {
        this.originalQuestionId = originalQuestionId;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }
}
