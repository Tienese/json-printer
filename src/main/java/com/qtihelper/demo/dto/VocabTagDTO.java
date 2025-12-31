package com.qtihelper.demo.dto;

/**
 * DTO for vocabulary tag information.
 * 
 * Responsibility: Transfer tag data for vocab endpoints
 * Dependencies: None
 */
public record VocabTagDTO(
        Long id,
        String name,
        String category) {
}
