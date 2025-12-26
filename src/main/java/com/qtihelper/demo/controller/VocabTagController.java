package com.qtihelper.demo.controller;

import com.qtihelper.demo.entity.VocabTag;
import com.qtihelper.demo.service.VocabTagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing vocabulary semantic tags.
 * Provides CRUD endpoints for the Language Coach admin UI.
 */
@RestController
@RequestMapping("/api/vocab-tags")
public class VocabTagController {

    private final VocabTagService tagService;

    public VocabTagController(VocabTagService tagService) {
        this.tagService = tagService;
    }

    /**
     * Get all tags, optionally filtered by category.
     */
    @GetMapping
    public List<VocabTag> getAllTags(@RequestParam(required = false) String category) {
        return tagService.getAllTags(category);
    }

    /**
     * Get a single tag by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VocabTag> getTagById(@PathVariable Long id) {
        return tagService.getTagById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new tag.
     */
    @PostMapping
    public ResponseEntity<VocabTag> createTag(@RequestBody CreateTagRequest request) {
        try {
            VocabTag created = tagService.createTag(
                    request.name(),
                    request.category(),
                    request.description(),
                    request.examples());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing tag.
     */
    @PutMapping("/{id}")
    public ResponseEntity<VocabTag> updateTag(@PathVariable Long id, @RequestBody CreateTagRequest request) {
        try {
            VocabTag updated = tagService.updateTag(
                    id,
                    request.name(),
                    request.category(),
                    request.description(),
                    request.examples());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a tag.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        try {
            tagService.deleteTag(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Seed default N5 tags.
     */
    @PostMapping("/seed-defaults")
    public ResponseEntity<Void> seedDefaults() {
        tagService.seedDefaultTags();
        return ResponseEntity.ok().build();
    }

    // Request DTOs
    public record CreateTagRequest(
            String name,
            String category,
            String description,
            String examples) {
    }
}
