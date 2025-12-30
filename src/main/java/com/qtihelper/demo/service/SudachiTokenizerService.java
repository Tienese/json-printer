package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.TokenResult;
import com.worksap.nlp.sudachi.Dictionary;
import com.worksap.nlp.sudachi.DictionaryFactory;
import com.worksap.nlp.sudachi.Morpheme;
import com.worksap.nlp.sudachi.Tokenizer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Sudachi-based Japanese tokenizer for Grammar Coach V4.0.
 * Uses Sudachi Mode B for compound noun handling.
 * 
 * Responsibility: Japanese text tokenization with morphological analysis
 * Dependencies: Sudachi dictionary at resources/sudachi/system_full.dic
 */
@Service
public class SudachiTokenizerService implements TokenizerService {

    private static final Logger log = LoggerFactory.getLogger(SudachiTokenizerService.class);

    // Parts of speech to filter out (particles, punctuation, symbols)
    private static final Set<String> IGNORED_POS_PREFIXES = Set.of(
            "助詞", // Particles (wa, ga, wo, etc.)
            "記号", // Symbols/punctuation
            "補助記号" // Auxiliary symbols
    );

    private Dictionary dictionary;
    private Tokenizer tokenizer;

    @PostConstruct
    public void init() {
        log.info("Initializing Sudachi Japanese tokenizer...");
        long start = System.currentTimeMillis();

        try {
            // Extract dictionary and config to temp directory
            Path tempDir = Files.createTempDirectory("sudachi");
            Path configFile = tempDir.resolve("sudachi.json");
            Path dictFile = tempDir.resolve("system_full.dic");

            // Copy config
            try (InputStream configStream = getClass().getResourceAsStream("/sudachi/sudachi.json")) {
                if (configStream == null)
                    throw new IOException("sudachi.json not found");
                Files.copy(configStream, configFile);
            }

            // Copy dictionary
            try (InputStream dictStream = getClass().getResourceAsStream("/sudachi/system_full.dic")) {
                if (dictStream == null)
                    throw new IOException("system_full.dic not found");
                Files.copy(dictStream, dictFile);
            }

            // Read config and update dictionary path to absolute
            String configJson = Files.readString(configFile);
            String absoluteDictPath = dictFile.toAbsolutePath().toString().replace("\\", "/");
            configJson = configJson.replace("system_full.dic", absoluteDictPath);

            // Create dictionary with JSON content
            dictionary = new DictionaryFactory().create(configJson);
            tokenizer = dictionary.create();

            long elapsed = System.currentTimeMillis() - start;
            log.info("Sudachi tokenizer initialized in {}ms", elapsed);
        } catch (IOException e) {
            log.error("Failed to initialize Sudachi tokenizer: {}", e.getMessage());
            throw new RuntimeException("Sudachi initialization failed", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (dictionary != null) {
            try {
                dictionary.close();
                log.info("Sudachi dictionary closed");
            } catch (IOException e) {
                log.error("Failed to close Sudachi dictionary: {}", e.getMessage());
            }
        }
    }

    @Override
    public List<TokenResult> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<Morpheme> morphemes = tokenizer.tokenize(Tokenizer.SplitMode.B, text);

        return morphemes.stream()
                .map(this::toTokenResult)
                .toList();
    }

    /**
     * Tokenize text and return only base forms (for backward compatibility).
     * Filters out particles, punctuation, and symbols.
     *
     * @param text Input Japanese text
     * @return List of base forms (lemmas) for meaningful words
     */
    public List<String> tokenizeToBaseForms(String text) {
        return tokenize(text).stream()
                .filter(t -> !shouldIgnore(t.posLevel1()))
                .map(TokenResult::baseForm)
                .toList();
    }

    /**
     * Legacy TokenResult for backward compatibility with existing code.
     */
    public record LegacyTokenResult(String surface, String baseForm, String pos) {
    }

    /**
     * Tokenize with legacy format for backward compatibility.
     * Filters out particles, punctuation, and symbols.
     */
    public List<LegacyTokenResult> tokenizeWithPos(String text) {
        return tokenize(text).stream()
                .filter(t -> !shouldIgnore(t.posLevel1()))
                .map(t -> new LegacyTokenResult(t.surface(), t.baseForm(), t.pos()))
                .toList();
    }

    /**
     * Tokenize including particles. Used for slot detection.
     * Only filters out symbols and punctuation, keeps particles (助詞).
     */
    public List<LegacyTokenResult> tokenizeWithPosIncludeParticles(String text) {
        return tokenize(text).stream()
                .filter(t -> {
                    String pos = t.posLevel1();
                    return pos == null || (!pos.startsWith("記号") && !pos.startsWith("補助記号"));
                })
                .map(t -> new LegacyTokenResult(t.surface(), t.baseForm(), t.pos()))
                .toList();
    }

    /**
     * Normalize a single word to its dictionary form.
     */
    public String normalizeWord(String word) {
        if (word == null || word.isBlank()) {
            return word;
        }

        List<String> tokens = tokenizeToBaseForms(word.trim());
        return tokens.isEmpty() ? word.trim() : tokens.get(0);
    }

    /**
     * Normalize a single word and return both base form and POS.
     */
    public LegacyTokenResult normalizeWordWithPos(String word) {
        if (word == null || word.isBlank()) {
            return null;
        }

        List<LegacyTokenResult> tokens = tokenizeWithPos(word.trim());
        if (tokens.isEmpty()) {
            return new LegacyTokenResult(word.trim(), word.trim(), null);
        }
        return tokens.get(0);
    }

    /**
     * Convert Sudachi Morpheme to TokenResult.
     */
    private TokenResult toTokenResult(Morpheme m) {
        List<String> posParts = m.partOfSpeech();
        String fullPos = String.join(",", posParts);
        String posLevel1 = posParts.isEmpty() ? "" : posParts.get(0);

        // Conjugation info is at positions 4 and 5 in Sudachi POS
        String conjugationType = posParts.size() > 4 ? posParts.get(4) : null;
        String conjugationForm = posParts.size() > 5 ? posParts.get(5) : null;

        return new TokenResult(
                m.surface(),
                m.dictionaryForm(),
                fullPos,
                posLevel1,
                m.readingForm(),
                m.begin(),
                m.end(),
                conjugationType,
                conjugationForm,
                m.normalizedForm());
    }

    /**
     * Check if a POS tag should be ignored.
     */
    private boolean shouldIgnore(String pos) {
        if (pos == null)
            return false;
        for (String prefix : IGNORED_POS_PREFIXES) {
            if (pos.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the tokenizer is ready.
     */
    public boolean isReady() {
        return tokenizer != null;
    }
}
