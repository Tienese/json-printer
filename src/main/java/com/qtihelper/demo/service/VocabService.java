package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.TokenResult;
import com.qtihelper.demo.entity.Sentence;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.SentenceRepository;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for Vocab CRUD operations with DIRTY sentence resolution.
 * 
 * Responsibility: Vocab management and sentence DIRTY status resolution
 * Dependencies: VocabRepository, SentenceRepository, SudachiTokenizerService
 */
@Service
public class VocabService {

    private static final Logger log = LoggerFactory.getLogger(VocabService.class);

    private final VocabRepository vocabRepository;
    private final SentenceRepository sentenceRepository;
    private final SudachiTokenizerService tokenizerService;

    public VocabService(
            VocabRepository vocabRepository,
            SentenceRepository sentenceRepository,
            SudachiTokenizerService tokenizerService) {
        this.vocabRepository = vocabRepository;
        this.sentenceRepository = sentenceRepository;
        this.tokenizerService = tokenizerService;
    }

    public List<Vocab> findAll() {
        return vocabRepository.findAll();
    }

    public Optional<Vocab> findById(Long id) {
        return vocabRepository.findById(id);
    }

    public List<Vocab> findByLessonId(Integer lessonId) {
        return vocabRepository.findByLessonId(lessonId);
    }

    /**
     * Save a vocab and trigger DIRTY sentence resolution.
     */
    @Transactional
    public Vocab save(Vocab vocab) {
        vocab = vocabRepository.save(vocab);

        // Trigger DIRTY resolution for sentences that might contain this word
        String word = vocab.getDisplayForm();
        if (word != null && !word.isBlank()) {
            resolveDirtySentences(word);
        }

        // Also check base form if different
        String baseForm = vocab.getBaseForm();
        if (baseForm != null && !baseForm.isBlank() && !baseForm.equals(word)) {
            resolveDirtySentences(baseForm);
        }

        return vocab;
    }

    @Transactional
    public void delete(Long id) {
        vocabRepository.deleteById(id);
    }

    /**
     * Resolve DIRTY sentences that contain the newly added word.
     * Re-checks unknown vocab and updates status to UNCHECKED if all vocab is now
     * known.
     */
    private void resolveDirtySentences(String newWord) {
        List<Sentence> dirtySentences = sentenceRepository.findByValidationStatus("DIRTY");

        for (Sentence sentence : dirtySentences) {
            if (sentence.getText().contains(newWord)) {
                log.debug("Re-checking DIRTY sentence {} for word '{}'", sentence.getId(), newWord);

                // Re-check unknown vocab
                List<TokenResult> tokens = tokenizerService.tokenize(sentence.getText());
                List<String> stillUnknown = findUnknownVocab(tokens);

                if (stillUnknown.isEmpty()) {
                    sentence.setValidationStatus("UNCHECKED");
                    sentence.setValidationMessage(null);
                    log.info("Resolved DIRTY sentence {} - all vocab now known", sentence.getId());
                } else {
                    sentence.setValidationMessage("Unknown vocabulary: " + String.join(", ", stillUnknown));
                }

                sentenceRepository.save(sentence);
            }
        }
    }

    /**
     * Find unknown vocabulary in tokens.
     * Returns list of surface forms that are not in vocab database.
     */
    public List<String> findUnknownVocab(List<TokenResult> tokens) {
        List<String> unknown = new ArrayList<>();

        for (TokenResult token : tokens) {
            // Skip non-content words
            if (!isContentWord(token)) {
                continue;
            }

            // Check if vocab exists by surface form
            List<Vocab> vocabs = vocabRepository.findByDisplayForm(token.surface());
            if (vocabs.isEmpty()) {
                // Try base form as fallback
                vocabs = vocabRepository.findByBaseForm(token.baseForm());
            }

            if (vocabs.isEmpty()) {
                unknown.add(token.surface());
            }
        }

        return unknown;
    }

    /**
     * Check if a token is a content word (noun, verb, adjective, adverb).
     * Non-content words like particles and punctuation are skipped.
     */
    private boolean isContentWord(TokenResult token) {
        String pos = token.posLevel1();
        return "名詞".equals(pos) || "動詞".equals(pos) ||
                "形容詞".equals(pos) || "副詞".equals(pos);
    }
}
