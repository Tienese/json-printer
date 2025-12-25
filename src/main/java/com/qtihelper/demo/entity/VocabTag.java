package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Semantic tag for vocabulary categorization.
 * Used for grammar analysis and recommendation engine.
 * 
 * Categories:
 * - semantic: transport, tool, food, person, animal
 * - grammar_role: subject, object, honorific, suffix, counter
 * - pos: auto-populated from Kuromoji
 */
@Entity
@Table(name = "vocab_tag")
public class VocabTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "transport", "tool", "honorific"

    @Column(nullable = false)
    private String category; // e.g., "semantic", "grammar_role", "pos"

    @Column
    private String description; // Human-readable description

    @Column
    private String examples; // Example words, comma-separated

    // Constructors
    public VocabTag() {
    }

    public VocabTag(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExamples() {
        return examples;
    }

    public void setExamples(String examples) {
        this.examples = examples;
    }
}
