package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.ValidationResultDTO;
import com.qtihelper.demo.entity.Sentence;
import com.qtihelper.demo.entity.SentenceVocabLink;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.SentenceRepository;
import com.qtihelper.demo.repository.SentenceVocabLinkRepository;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for Sentence CRUD and validation operations.
 * 
 * Responsibility: Sentence management and validation orchestration
 * Dependencies: SentenceRepository, SentenceValidationService, VocabRepository
 */
@Service
public class SentenceService {

    private static final Logger log = LoggerFactory.getLogger(SentenceService.class);

    private final SentenceRepository sentenceRepository;
    private final SentenceVocabLinkRepository linkRepository;
    private final SentenceValidationService validationService;
    private final VocabRepository vocabRepository;
    private final SudachiTokenizerService tokenizerService;

    public SentenceService(
            SentenceRepository sentenceRepository,
            SentenceVocabLinkRepository linkRepository,
            SentenceValidationService validationService,
            VocabRepository vocabRepository,
            SudachiTokenizerService tokenizerService) {
        this.sentenceRepository = sentenceRepository;
        this.linkRepository = linkRepository;
        this.validationService = validationService;
        this.vocabRepository = vocabRepository;
        this.tokenizerService = tokenizerService;
    }

    // CRUD Operations

    public List<Sentence> findAll() {
        return sentenceRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Optional<Sentence> findById(Long id) {
        return sentenceRepository.findById(id);
    }

    public List<Sentence> findByLessonId(Integer lessonId) {
        return sentenceRepository.findByLessonId(lessonId);
    }

    public List<Sentence> findByValidationStatus(String status) {
        return sentenceRepository.findByValidationStatus(status);
    }

    @Transactional
    public Sentence save(Sentence sentence) {
        return sentenceRepository.save(sentence);
    }

    @Transactional
    public void delete(Long id) {
        linkRepository.deleteBySentenceId(id);
        sentenceRepository.deleteById(id);
    }

    // Validation Operations

    /**
     * Validate a sentence and update its status.
     */
    @Transactional
    public Sentence validateSentence(Long id) {
        Sentence sentence = sentenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sentence not found: " + id));

        ValidationResultDTO result = validationService.validate(sentence.getText());

        sentence.setValidationStatus(result.isValid() ? "VALID" : "INVALID");
        if (!result.isValid() && !result.violations().isEmpty()) {
            String message = result.violations().stream()
                    .map(v -> v.word() + ": " + v.message())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("");
            sentence.setValidationMessage(message);
        } else {
            sentence.setValidationMessage(null);
        }

        return sentenceRepository.save(sentence);
    }

    /**
     * Validate all sentences and update their statuses.
     */
    @Transactional
    public int validateAllSentences() {
        List<Sentence> sentences = sentenceRepository.findAll();
        int count = 0;

        for (Sentence sentence : sentences) {
            ValidationResultDTO result = validationService.validate(sentence.getText());
            sentence.setValidationStatus(result.isValid() ? "VALID" : "INVALID");
            if (!result.isValid() && !result.violations().isEmpty()) {
                String message = result.violations().stream()
                        .map(v -> v.word() + ": " + v.message())
                        .reduce((a, b) -> a + "; " + b)
                        .orElse("");
                sentence.setValidationMessage(message);
            } else {
                sentence.setValidationMessage(null);
            }
            sentenceRepository.save(sentence);
            count++;
        }

        log.info("Validated {} sentences", count);
        return count;
    }

    // Vocab Linking Operations

    /**
     * Get vocab links for a sentence.
     */
    public List<SentenceVocabLink> getVocabLinks(Long sentenceId) {
        return linkRepository.findBySentenceId(sentenceId);
    }

    /**
     * Find sentences that contain a specific vocab.
     */
    public List<Sentence> findByVocabId(Long vocabId) {
        List<SentenceVocabLink> links = linkRepository.findByVocabId(vocabId);
        List<Sentence> sentences = new ArrayList<>();
        for (SentenceVocabLink link : links) {
            sentenceRepository.findById(link.getSentenceId())
                    .ifPresent(sentences::add);
        }
        return sentences;
    }

    /**
     * Auto-link vocabulary in a sentence by tokenizing and matching.
     */
    @Transactional
    public List<SentenceVocabLink> autoLinkVocab(Long sentenceId) {
        Sentence sentence = sentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new IllegalArgumentException("Sentence not found: " + sentenceId));

        // Clear existing links
        linkRepository.deleteBySentenceId(sentenceId);

        // Tokenize the sentence
        List<String> baseForms = tokenizerService.tokenizeToBaseForms(sentence.getText());
        List<SentenceVocabLink> links = new ArrayList<>();

        // Match each base form to vocab
        for (int i = 0; i < baseForms.size(); i++) {
            String baseForm = baseForms.get(i);
            List<Vocab> vocabs = vocabRepository.findByBaseForm(baseForm);

            for (Vocab vocab : vocabs) {
                SentenceVocabLink link = new SentenceVocabLink();
                link.setSentenceId(sentenceId);
                link.setVocabId(vocab.getId());
                link.setPosition(i);
                links.add(linkRepository.save(link));
            }
        }

        log.info("Auto-linked {} vocab items to sentence {}", links.size(), sentenceId);
        return links;
    }
}
