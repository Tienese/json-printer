package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.TokenResult;

import java.util.List;

/**
 * Tokenizer interface for Japanese text analysis.
 * 
 * Responsibility: Abstract tokenization for Grammar Coach validation
 * Dependencies: TokenResult DTO
 */
public interface TokenizerService {

    /**
     * Tokenize Japanese text and return detailed token information.
     * 
     * @param text Input Japanese text (sentence or phrase)
     * @return List of TokenResult with morphological analysis data
     */
    List<TokenResult> tokenize(String text);
}
