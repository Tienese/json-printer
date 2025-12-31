package com.qtihelper.demo.dto;

/**
 * Request DTO for adding a tag to vocabulary.
 * Either tagId or name should be provided.
 * 
 * Responsibility: Capture tag addition request data
 * Dependencies: None
 */
public record AddTagRequest(
        Long tagId,
        String name) {
}
