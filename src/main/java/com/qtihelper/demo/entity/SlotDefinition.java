package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Slot definition for Japanese grammar analysis.
 * Each slot represents a grammatical position marked by particles.
 * Used by Grammar Coach v3.0 for pattern analysis.
 */
@Entity
@Table(name = "slot_definition")
public class SlotDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "SUBJECT", "OBJECT", "LOCATION"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String particles; // JSON array: ["は", "が"]

    @Column
    private String description; // e.g., "Who performs the action"

    @Column
    private String humanTerm; // e.g., "WHO", "WHAT", "WHERE"

    @Column
    private String questionWord; // e.g., "だれ", "なに"

    @Column
    private Integer lessonIntroduced; // When this slot is first taught

    // Constructors
    public SlotDefinition() {
    }

    public SlotDefinition(String name, String particles, String description,
            String humanTerm, String questionWord, Integer lessonIntroduced) {
        this.name = name;
        this.particles = particles;
        this.description = description;
        this.humanTerm = humanTerm;
        this.questionWord = questionWord;
        this.lessonIntroduced = lessonIntroduced;
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

    public String getParticles() {
        return particles;
    }

    public void setParticles(String particles) {
        this.particles = particles;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHumanTerm() {
        return humanTerm;
    }

    public void setHumanTerm(String humanTerm) {
        this.humanTerm = humanTerm;
    }

    public String getQuestionWord() {
        return questionWord;
    }

    public void setQuestionWord(String questionWord) {
        this.questionWord = questionWord;
    }

    public Integer getLessonIntroduced() {
        return lessonIntroduced;
    }

    public void setLessonIntroduced(Integer lessonIntroduced) {
        this.lessonIntroduced = lessonIntroduced;
    }
}
