package com.qtihelper.demo.dto;

import java.util.List;

/**
 * DTO for vocabulary item with tags.
 * Used for listing vocabulary with tag information.
 * 
 * Responsibility: Transfer vocab data with tags for list operations
 * Dependencies: VocabTagDTO
 */
public record VocabWithTagsDTO(
        Long id,
        String word,
        String reading,
        String meaning,
        Integer lessonId,
        String baseForm,
        String partOfSpeech,
        String category,
        List<VocabTagDTO> tags,
        Integer sentenceCount) {
}
