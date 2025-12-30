package com.qtihelper.demo.dto;

import java.util.List;

/**
 * Result of sentence validation.
 * 
 * Responsibility: DTO for validation endpoint response
 * Dependencies: ViolationDTO
 */
public record ValidationResultDTO(
        boolean isValid,
        List<ViolationDTO> violations) {
}
