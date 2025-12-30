package com.qtihelper.demo.dto;

/**
 * Result of tokenizing a Japanese word with full morphological data.
 * 
 * Responsibility: DTO for tokenizer output in Grammar Coach V4.0
 * Dependencies: None
 */
public record TokenResult(
        String surface, // Surface form (e.g., 食べ)
        String baseForm, // Dictionary form (e.g., 食べる)
        String pos, // Full POS string (e.g., 動詞,非自立可能,*,*,下一段-バ行,連用形-一般)
        String posLevel1, // First POS level (e.g., 動詞)
        String reading, // Reading in katakana (e.g., タベ)
        int startOffset, // Character start offset in original text
        int endOffset, // Character end offset in original text
        String conjugationType, // Conjugation type (e.g., 下一段-バ行)
        String conjugationForm, // Conjugation form (e.g., 連用形-一般)
        String normalizedForm // Normalized form from Sudachi
) {
}
