package com.qtihelper.demo.entity;

import jakarta.persistence.*;

/**
 * Join table for many-to-many relationship between Vocab and VocabTag.
 * A word can have multiple tags, and a tag can apply to multiple words.
 */
@Entity
@Table(name = "vocab_tag_mapping", uniqueConstraints = @UniqueConstraint(columnNames = { "vocab_id", "tag_id" }))
public class VocabTagMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocab_id", nullable = false)
    private Vocab vocab;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private VocabTag tag;

    // Constructors
    public VocabTagMapping() {
    }

    public VocabTagMapping(Vocab vocab, VocabTag tag) {
        this.vocab = vocab;
        this.tag = tag;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vocab getVocab() {
        return vocab;
    }

    public void setVocab(Vocab vocab) {
        this.vocab = vocab;
    }

    public VocabTag getTag() {
        return tag;
    }

    public void setTag(VocabTag tag) {
        this.tag = tag;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof VocabTagMapping that))
            return false;
        return vocab != null && tag != null &&
                java.util.Objects.equals(vocab.getId(), that.vocab.getId()) &&
                java.util.Objects.equals(tag.getId(), that.tag.getId());
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(VocabTagMapping.class);
    }
}
