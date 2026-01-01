package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.SentenceVocabLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Repository for SentenceVocabLink entity.
 */
@Repository
public interface SentenceVocabLinkRepository extends JpaRepository<SentenceVocabLink, Long> {

    List<SentenceVocabLink> findBySentenceId(Long sentenceId);

    List<SentenceVocabLink> findByVocabId(Long vocabId);

    @Query("SELECT l.vocabId, COUNT(l) FROM SentenceVocabLink l WHERE l.vocabId IN :vocabIds GROUP BY l.vocabId")
    List<Object[]> countByVocabIdIn(@Param("vocabIds") Collection<Long> vocabIds);

    void deleteBySentenceId(Long sentenceId);
}
