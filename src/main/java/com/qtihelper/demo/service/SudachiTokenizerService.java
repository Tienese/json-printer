package com.qtihelper.demo.service;

import jakarta.annotation.PostConstruct;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.ja.JapaneseAnalyzer;
import org.apache.lucene.analysis.ja.JapaneseTokenizer;
import org.apache.lucene.analysis.ja.tokenattributes.BaseFormAttribute;
import org.apache.lucene.analysis.ja.tokenattributes.PartOfSpeechAttribute;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Service wrapper around Kuromoji (Lucene Japanese Analyzer).
 * Provides lemmatization (dictionary form extraction) for vocabulary analysis.
 */
@Service
public class SudachiTokenizerService {

    private static final Logger log = LoggerFactory.getLogger(SudachiTokenizerService.class);

    // Parts of speech to filter out (particles, punctuation, symbols)
    private static final Set<String> IGNORED_POS_PREFIXES = Set.of(
            "助詞", // Particles (wa, ga, wo, etc.)
            "記号", // Symbols/punctuation
            "補助記号" // Auxiliary symbols
    );

    private Analyzer analyzer;

    @PostConstruct
    public void init() {
        log.info("Initializing Kuromoji Japanese tokenizer...");
        long start = System.currentTimeMillis();

        // Use default JapaneseAnalyzer with IPADIC dictionary
        analyzer = new JapaneseAnalyzer();

        long elapsed = System.currentTimeMillis() - start;
        log.info("Kuromoji tokenizer initialized in {}ms", elapsed);
    }

    /**
     * Tokenize text and return list of base forms (dictionary forms).
     * Filters out particles, punctuation, and symbols.
     *
     * @param text Input Japanese text (can be single word or sentence)
     * @return List of base forms (lemmas) for meaningful words
     */
    public List<String> tokenize(String text) {
        return tokenizeWithPos(text).stream()
                .map(TokenResult::baseForm)
                .toList();
    }

    /**
     * Result of tokenizing a word, including base form and POS.
     */
    public record TokenResult(String surface, String baseForm, String pos) {
    }

    /**
     * Tokenize text and return list of TokenResult with base form and POS.
     * Filters out particles, punctuation, and symbols.
     *
     * @param text Input Japanese text
     * @return List of token results for meaningful words
     */
    public List<TokenResult> tokenizeWithPos(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<TokenResult> results = new ArrayList<>();

        try (TokenStream tokenStream = analyzer.tokenStream("content", new StringReader(text))) {
            CharTermAttribute termAttr = tokenStream.addAttribute(CharTermAttribute.class);
            BaseFormAttribute baseFormAttr = tokenStream.addAttribute(BaseFormAttribute.class);
            PartOfSpeechAttribute posAttr = tokenStream.addAttribute(PartOfSpeechAttribute.class);

            tokenStream.reset();

            while (tokenStream.incrementToken()) {
                String pos = posAttr.getPartOfSpeech();

                // Skip particles, symbols, punctuation
                if (pos != null && shouldIgnore(pos)) {
                    continue;
                }

                String surface = termAttr.toString();
                String baseForm = baseFormAttr.getBaseForm();
                if (baseForm == null || baseForm.isBlank()) {
                    baseForm = surface;
                }

                if (!baseForm.isBlank()) {
                    results.add(new TokenResult(surface, baseForm, pos));
                }
            }

            tokenStream.end();
        } catch (IOException e) {
            log.error("Failed to tokenize text: {}", e.getMessage());
        }

        return results;
    }

    /**
     * Normalize a single word to its dictionary form.
     * Useful for CSV import where each line is a single word.
     *
     * @param word Single Japanese word
     * @return Dictionary form, or original word if tokenization fails
     */
    public String normalizeWord(String word) {
        if (word == null || word.isBlank()) {
            return word;
        }

        List<String> tokens = tokenize(word.trim());

        if (tokens.isEmpty()) {
            return word.trim();
        }

        // For single-word input, return the first meaningful token's base form
        return tokens.get(0);
    }

    /**
     * Normalize a single word and return both base form and POS.
     * Used for vocabulary seeding with POS auto-tagging.
     *
     * @param word Single Japanese word
     * @return TokenResult with base form and POS, or null if tokenization fails
     */
    public TokenResult normalizeWordWithPos(String word) {
        if (word == null || word.isBlank()) {
            return null;
        }

        List<TokenResult> tokens = tokenizeWithPos(word.trim());

        if (tokens.isEmpty()) {
            return new TokenResult(word.trim(), word.trim(), null);
        }

        return tokens.get(0);
    }

    /**
     * Check if a POS tag should be ignored.
     */
    private boolean shouldIgnore(String pos) {
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
        return analyzer != null;
    }
}
