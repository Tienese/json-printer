package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Vocabulary entity for storing lesson vocabulary words.
 * Used for gap analysis to compare worksheet content against lesson vocabulary.
 */
@Entity
@Table(name = "vocab")
public class Vocab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer lessonId;

    @Column(nullable = false)
    private String displayForm; // Original form from CSV (e.g., "学生" or "がくせい")

    @Column(nullable = false)
    private String baseForm; // Sudachi normalized form (dictionary form)

    // Constructors
    public Vocab() {
    }

    public Vocab(Integer lessonId, String displayForm, String baseForm) {
        this.lessonId = lessonId;
        this.displayForm = displayForm;
        this.baseForm = baseForm;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getLessonId() {
        return lessonId;
    }

    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }

    public String getDisplayForm() {
        return displayForm;
    }

    public void setDisplayForm(String displayForm) {
        this.displayForm = displayForm;
    }

    public String getBaseForm() {
        return baseForm;
    }

    public void setBaseForm(String baseForm) {
        this.baseForm = baseForm;
    }
}
