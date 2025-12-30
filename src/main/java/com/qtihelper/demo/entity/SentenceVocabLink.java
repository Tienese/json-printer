package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Link between Sentence and Vocab for tracking word occurrences.
 * 
 * Responsibility: Track vocab usage in sentences with position
 * Dependencies: Sentence, Vocab entities
 */
@Entity
@Table(name = "sentence_vocab_links")
public class SentenceVocabLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sentence_id", nullable = false)
    private Long sentenceId;

    @Column(name = "vocab_id", nullable = false)
    private Long vocabId;

    @Column
    private Integer position;

    @Column(name = "detected_slot", length = 30)
    private String detectedSlot; // V5.0 hook

    @Column(length = 10)
    private String particle; // V5.0 hook

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSentenceId() {
        return sentenceId;
    }

    public void setSentenceId(Long sentenceId) {
        this.sentenceId = sentenceId;
    }

    public Long getVocabId() {
        return vocabId;
    }

    public void setVocabId(Long vocabId) {
        this.vocabId = vocabId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public String getDetectedSlot() {
        return detectedSlot;
    }

    public void setDetectedSlot(String detectedSlot) {
        this.detectedSlot = detectedSlot;
    }

    public String getParticle() {
        return particle;
    }

    public void setParticle(String particle) {
        this.particle = particle;
    }
}
