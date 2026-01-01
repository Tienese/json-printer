package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.VocabTagMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Repository for VocabTagMapping entity.
 * Manages word-to-tag relationships.
 */
@Repository
public interface VocabTagMappingRepository extends JpaRepository<VocabTagMapping, Long> {

    List<VocabTagMapping> findByVocabId(Long vocabId);

    List<VocabTagMapping> findByVocabIdIn(Collection<Long> vocabIds);

    List<VocabTagMapping> findByTagId(Long tagId);

    void deleteByVocabId(Long vocabId);

    void deleteByTagId(Long tagId);

    VocabTagMapping findByVocabIdAndTagId(Long vocabId, Long tagId);

    boolean existsByVocabIdAndTagId(Long vocabId, Long tagId);

    /**
     * Find tag names for a vocab (for validation).
     */
    @Query("SELECT m.tag.name FROM VocabTagMapping m WHERE m.vocab.id = :vocabId")
    List<String> findTagNamesByVocabId(@Param("vocabId") Long vocabId);
}
