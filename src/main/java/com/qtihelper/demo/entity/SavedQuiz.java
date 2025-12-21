package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SavedQuiz entity for caching parsed quiz data.
 */
@Entity
@Table(name = "saved_quizzes")
public class SavedQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String canvasQuizId; // Canvas quiz ID for lookup

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String jsonContent; // Full quiz JSON

    @Column(nullable = false)
    private LocalDateTime savedAt;

    @PrePersist
    protected void onCreate() {
        savedAt = LocalDateTime.now();
    }

    // Constructors
    public SavedQuiz() {
    }

    public SavedQuiz(String canvasQuizId, String title, String jsonContent) {
        this.canvasQuizId = canvasQuizId;
        this.title = title;
        this.jsonContent = jsonContent;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCanvasQuizId() {
        return canvasQuizId;
    }

    public void setCanvasQuizId(String canvasQuizId) {
        this.canvasQuizId = canvasQuizId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getJsonContent() {
        return jsonContent;
    }

    public void setJsonContent(String jsonContent) {
        this.jsonContent = jsonContent;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
