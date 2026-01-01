package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.AddTagRequest;
import com.qtihelper.demo.dto.SentenceSummaryDTO;
import com.qtihelper.demo.dto.VocabTagDTO;
import com.qtihelper.demo.dto.VocabWithTagsDTO;
import com.qtihelper.demo.entity.Sentence;
import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.entity.VocabTag;
import com.qtihelper.demo.entity.VocabTagMapping;
import com.qtihelper.demo.repository.VocabRepository;
import com.qtihelper.demo.repository.VocabTagMappingRepository;
import com.qtihelper.demo.service.SentenceService;
import com.qtihelper.demo.service.VocabTagService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for Vocabulary operations.
 * 
 * Responsibility: HTTP endpoints for vocab list, tags, and linked sentences
 * Dependencies: VocabRepository, VocabTagService, VocabTagMappingRepository,
 * SentenceService
 */
@RestController
@RequestMapping("/api/vocab")
public class VocabController {

    private final VocabRepository vocabRepository;
    private final VocabTagService vocabTagService;
    private final VocabTagMappingRepository tagMappingRepository;
    private final SentenceService sentenceService;

    public VocabController(
            VocabRepository vocabRepository,
            VocabTagService vocabTagService,
            VocabTagMappingRepository tagMappingRepository,
            SentenceService sentenceService) {
        this.vocabRepository = vocabRepository;
        this.vocabTagService = vocabTagService;
        this.tagMappingRepository = tagMappingRepository;
        this.sentenceService = sentenceService;
    }

    /**
     * List vocabulary with optional filters.
     * Supports lessonId, lessonStart/End range, search, and category filters.
     */
    @GetMapping
    public List<VocabWithTagsDTO> listVocab(
            @RequestParam(required = false) Integer lessonId,
            @RequestParam(required = false) Integer lessonStart,
            @RequestParam(required = false) Integer lessonEnd,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {

        // Priority: search > lesson range > single lesson > category > all
        var vocabs = (search != null && !search.isBlank())
                ? vocabRepository.searchByDisplayFormOrBaseForm(search.trim())
                : (lessonStart != null && lessonEnd != null)
                        ? vocabRepository.findByLessonIdBetween(lessonStart, lessonEnd)
                        : (lessonId != null)
                                ? vocabRepository.findByLessonId(lessonId)
                                : (category != null && !category.isBlank())
                                        ? vocabRepository.findByCategory(category)
                                        : vocabRepository.findAll();

        if (vocabs.isEmpty()) {
            return Collections.emptyList();
        }

        // Optimize: Batch fetch tags and sentence counts to solve N+1 problem
        var vocabIds = vocabs.stream().map(Vocab::getId).toList();

        // 1. Batch fetch tags
        var allMappings = tagMappingRepository.findByVocabIdIn(vocabIds);
        var tagsByVocabId = allMappings.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getVocab().getId(),
                        Collectors.mapping(m -> new VocabTagDTO(
                                m.getTag().getId(),
                                m.getTag().getName(),
                                m.getTag().getCategory()), Collectors.toList())));

        // 2. Batch fetch sentence counts
        var sentenceCountsByVocabId = sentenceService.getSentenceCountsByVocabIds(vocabIds);

        return vocabs.stream()
                .map(v -> toVocabWithTagsDTO(v,
                        tagsByVocabId.getOrDefault(v.getId(), Collections.emptyList()),
                        sentenceCountsByVocabId.getOrDefault(v.getId(), 0)))
                .toList();
    }

    /**
     * Get single vocabulary by ID with tags and linked sentences.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VocabWithTagsDTO> getVocab(@PathVariable Long id) {
        return vocabRepository.findById(id)
                .map(this::toVocabWithTagsDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get tags for a vocabulary item.
     */
    @GetMapping("/{id}/tags")
    public ResponseEntity<List<VocabTagDTO>> getTags(@PathVariable Long id) {
        if (vocabRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var mappings = tagMappingRepository.findByVocabId(id);
        var tags = mappings.stream()
                .map(m -> new VocabTagDTO(
                        m.getTag().getId(),
                        m.getTag().getName(),
                        m.getTag().getCategory()))
                .toList();

        return ResponseEntity.ok(tags);
    }

    /**
     * Add tag to vocabulary.
     * Supports either tagId (existing tag) or name (create if needed).
     */
    @PostMapping("/{id}/tags")
    @Transactional
    public ResponseEntity<VocabTagDTO> addTag(
            @PathVariable Long id,
            @RequestBody AddTagRequest request) {

        var vocabOpt = vocabRepository.findById(id);
        if (vocabOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        VocabTag tag;

        // Find or create tag
        if (request.tagId() != null) {
            var tagOpt = vocabTagService.getTagById(request.tagId());
            if (tagOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            tag = tagOpt.get();
        } else if (request.name() != null && !request.name().isBlank()) {
            // Find existing tag by name or create new one
            var existingTag = vocabTagService.getTagByName(request.name());
            if (existingTag.isPresent()) {
                tag = existingTag.get();
            } else {
                // Create new tag with default category
                tag = vocabTagService.createTag(request.name(), "custom", null, null);
            }
        } else {
            return ResponseEntity.badRequest().build();
        }

        // Check if mapping already exists
        if (tagMappingRepository.existsByVocabIdAndTagId(id, tag.getId())) {
            // Already linked, just return the tag
            return ResponseEntity.ok(new VocabTagDTO(tag.getId(), tag.getName(), tag.getCategory()));
        }

        // Create mapping
        var mapping = new VocabTagMapping(vocabOpt.get(), tag);
        tagMappingRepository.save(mapping);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new VocabTagDTO(tag.getId(), tag.getName(), tag.getCategory()));
    }

    /**
     * Remove tag from vocabulary.
     */
    @DeleteMapping("/{id}/tags/{tagId}")
    @Transactional
    public ResponseEntity<Void> removeTag(
            @PathVariable Long id,
            @PathVariable Long tagId) {

        var mapping = tagMappingRepository.findByVocabIdAndTagId(id, tagId);
        if (mapping == null) {
            return ResponseEntity.notFound().build();
        }

        tagMappingRepository.delete(mapping);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get sentences linked to a vocabulary item.
     */
    @GetMapping("/{id}/sentences")
    public ResponseEntity<List<SentenceSummaryDTO>> getLinkedSentences(@PathVariable Long id) {
        if (vocabRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var sentences = sentenceService.findByVocabId(id);
        var dtos = sentences.stream()
                .map(s -> new SentenceSummaryDTO(
                        s.getId(),
                        s.getText(),
                        s.getLessonId(),
                        s.getValidationStatus(),
                        s.getValidationMessage()))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Get available lessons for dropdown filter.
     */
    @GetMapping("/lessons")
    public List<Integer> getLessons() {
        return vocabRepository.findDistinctLessonIds();
    }

    // ========== Helper Methods ==========

    /**
     * Convert Vocab entity to VocabWithTagsDTO.
     */
    private VocabWithTagsDTO toVocabWithTagsDTO(Vocab vocab) {
        // Use optimized call with default empty list/zero
        return toVocabWithTagsDTO(vocab, null, null);
    }

    /**
     * Convert Vocab entity to VocabWithTagsDTO with pre-fetched data.
     */
    private VocabWithTagsDTO toVocabWithTagsDTO(Vocab vocab, List<VocabTagDTO> preFetchedTags,
            Integer preFetchedSentenceCount) {
        var tags = preFetchedTags;
        if (tags == null) {
            var mappings = tagMappingRepository.findByVocabId(vocab.getId());
            tags = mappings.stream()
                    .map(m -> new VocabTagDTO(
                            m.getTag().getId(),
                            m.getTag().getName(),
                            m.getTag().getCategory()))
                    .toList();
        }

        var sentenceCount = preFetchedSentenceCount;
        if (sentenceCount == null) {
            sentenceCount = sentenceService.findByVocabId(vocab.getId()).size();
        }

        return new VocabWithTagsDTO(
                vocab.getId(),
                vocab.getDisplayForm(), // word
                "", // reading (not stored in DB)
                "", // meaning (not stored in DB)
                vocab.getLessonId(),
                vocab.getBaseForm(),
                vocab.getPartOfSpeech(),
                vocab.getCategory(),
                tags,
                sentenceCount);
    }
}
