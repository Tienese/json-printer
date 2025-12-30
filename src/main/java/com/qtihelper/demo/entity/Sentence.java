package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Sentence entity for storing example sentences.
 * Used for Grammar Coach V4.0 sentence bank and validation.
 * 
 * Responsibility: Store sentences with validation status
 * Dependencies: None
 */
@Entity
@Table(name = "sentences")
public class Sentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "lesson_id")
    private Integer lessonId;

    @Column(name = "expected_valid", nullable = false)
    private Boolean expectedValid = true;

    @Column(name = "validation_status", length = 20)
    private String validationStatus; // VALID, INVALID, UNCHECKED, DIRTY

    @Column(name = "validation_message", length = 1000)
    private String validationMessage;

    @Column(length = 500)
    private String notes;

    @Column(length = 50)
    private String source; // V5.0 hook: manual, vocab_view, grammar_view, import

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (validationStatus == null) {
            validationStatus = "UNCHECKED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getLessonId() {
        return lessonId;
    }

    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }

    public Boolean getExpectedValid() {
        return expectedValid;
    }

    public void setExpectedValid(Boolean expectedValid) {
        this.expectedValid = expectedValid;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getValidationMessage() {
        return validationMessage;
    }

    public void setValidationMessage(String validationMessage) {
        this.validationMessage = validationMessage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
