package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.ValidateRequest;
import com.qtihelper.demo.dto.ValidationResultDTO;
import com.qtihelper.demo.service.SentenceValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for validation endpoint.
 * 
 * Responsibility: Validate arbitrary text without storing
 * Dependencies: SentenceValidationService
 */
@RestController
@RequestMapping("/api/validate")
public class ValidationController {

    private final SentenceValidationService validationService;

    public ValidationController(SentenceValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping
    public ResponseEntity<ValidationResultDTO> validate(@RequestBody ValidateRequest request) {
        ValidationResultDTO result = validationService.validate(request.text());
        return ResponseEntity.ok(result);
    }
}
