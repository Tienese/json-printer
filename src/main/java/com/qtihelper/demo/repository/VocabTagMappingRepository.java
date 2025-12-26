package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.VocabTagMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for VocabTagMapping entity.
 * Manages word-to-tag relationships.
 */
@Repository
public interface VocabTagMappingRepository extends JpaRepository<VocabTagMapping, Long> {

    List<VocabTagMapping> findByVocabId(Long vocabId);

    List<VocabTagMapping> findByTagId(Long tagId);

    void deleteByVocabId(Long vocabId);

    void deleteByTagId(Long tagId);

    VocabTagMapping findByVocabIdAndTagId(Long vocabId, Long tagId);

    boolean existsByVocabIdAndTagId(Long vocabId, Long tagId);
}
