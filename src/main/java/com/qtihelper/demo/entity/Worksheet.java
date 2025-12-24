package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Worksheet entity for persisting user-created worksheets.
 */
@Entity
@Table(name = "worksheets", indexes = {
    @Index(name = "idx_worksheet_type", columnList = "type"),
    @Index(name = "idx_worksheet_parent_id", columnList = "parentId"),
    @Index(name = "idx_worksheet_updated_at", columnList = "updatedAt")
})
public class Worksheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String jsonContent; // Stores the full worksheet JSON

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorksheetType type = WorksheetType.SNAPSHOT;

    @Column
    private Long parentId; // FK to parent worksheet for autosaves

    @Lob
    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON: {"gridCount":2,"vocabCount":1,...}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Worksheet() {
    }

    public Worksheet(String name, String jsonContent) {
        this.name = name;
        this.jsonContent = jsonContent;
    }

    public Worksheet(String name, String jsonContent, WorksheetType type, Long parentId, String metadata) {
        this.name = name;
        this.jsonContent = jsonContent;
        this.type = type;
        this.parentId = parentId;
        this.metadata = metadata;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getJsonContent() {
        return jsonContent;
    }

    public void setJsonContent(String jsonContent) {
        this.jsonContent = jsonContent;
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

    public WorksheetType getType() {
        return type;
    }

    public void setType(WorksheetType type) {
        this.type = type;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
