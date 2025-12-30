package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.CreateSentenceRequest;
import com.qtihelper.demo.dto.ValidationResultDTO;
import com.qtihelper.demo.entity.Sentence;
import com.qtihelper.demo.entity.SentenceVocabLink;
import com.qtihelper.demo.service.SentenceService;
import com.qtihelper.demo.service.SentenceValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for Sentence operations.
 * 
 * Responsibility: HTTP endpoints for sentence CRUD and validation
 * Dependencies: SentenceService
 */
@RestController
@RequestMapping("/api/sentences")
public class SentenceController {

    private final SentenceService sentenceService;
    private final SentenceValidationService validationService;

    public SentenceController(
            SentenceService sentenceService,
            SentenceValidationService validationService) {
        this.sentenceService = sentenceService;
        this.validationService = validationService;
    }

    @GetMapping
    public List<Sentence> getAll(
            @RequestParam(required = false) Integer lessonId,
            @RequestParam(required = false) String status) {
        if (lessonId != null) {
            return sentenceService.findByLessonId(lessonId);
        }
        if (status != null) {
            return sentenceService.findByValidationStatus(status);
        }
        return sentenceService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sentence> getById(@PathVariable Long id) {
        return sentenceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sentence> create(@RequestBody CreateSentenceRequest request) {
        Sentence sentence = new Sentence();
        sentence.setText(request.text());
        sentence.setLessonId(request.lessonId());
        sentence.setExpectedValid(request.expectedValid() != null ? request.expectedValid() : true);
        sentence.setNotes(request.notes());
        sentence.setSource("manual");

        Sentence saved = sentenceService.save(sentence);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sentence> update(
            @PathVariable Long id,
            @RequestBody CreateSentenceRequest request) {
        return sentenceService.findById(id)
                .map(sentence -> {
                    if (request.text() != null)
                        sentence.setText(request.text());
                    if (request.lessonId() != null)
                        sentence.setLessonId(request.lessonId());
                    if (request.expectedValid() != null)
                        sentence.setExpectedValid(request.expectedValid());
                    if (request.notes() != null)
                        sentence.setNotes(request.notes());
                    sentence.setValidationStatus("DIRTY"); // Mark for re-validation
                    return ResponseEntity.ok(sentenceService.save(sentence));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (sentenceService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        sentenceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Sentence> validateSentence(@PathVariable Long id) {
        try {
            Sentence validated = sentenceService.validateSentence(id);
            return ResponseEntity.ok(validated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/validate-all")
    public ResponseEntity<Map<String, Integer>> validateAll() {
        int count = sentenceService.validateAllSentences();
        return ResponseEntity.ok(Map.of("validated", count));
    }

    @GetMapping("/{id}/vocab-links")
    public ResponseEntity<List<SentenceVocabLink>> getVocabLinks(@PathVariable Long id) {
        if (sentenceService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sentenceService.getVocabLinks(id));
    }

    @PostMapping("/{id}/auto-link")
    public ResponseEntity<List<SentenceVocabLink>> autoLink(@PathVariable Long id) {
        try {
            List<SentenceVocabLink> links = sentenceService.autoLinkVocab(id);
            return ResponseEntity.ok(links);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
