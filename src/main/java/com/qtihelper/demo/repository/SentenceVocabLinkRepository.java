package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.SentenceVocabLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for SentenceVocabLink entity.
 */
@Repository
public interface SentenceVocabLinkRepository extends JpaRepository<SentenceVocabLink, Long> {

    List<SentenceVocabLink> findBySentenceId(Long sentenceId);

    List<SentenceVocabLink> findByVocabId(Long vocabId);

    void deleteBySentenceId(Long sentenceId);
}
