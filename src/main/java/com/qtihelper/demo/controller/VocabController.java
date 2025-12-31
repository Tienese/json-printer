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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        List<Vocab> vocabs;

        // Priority: search > lesson range > single lesson > category > all
        if (search != null && !search.isBlank()) {
            vocabs = vocabRepository.searchByDisplayFormOrBaseForm(search.trim());
        } else if (lessonStart != null && lessonEnd != null) {
            vocabs = vocabRepository.findByLessonIdBetween(lessonStart, lessonEnd);
        } else if (lessonId != null) {
            vocabs = vocabRepository.findByLessonId(lessonId);
        } else if (category != null && !category.isBlank()) {
            vocabs = vocabRepository.findByCategory(category);
        } else {
            vocabs = vocabRepository.findAll();
        }

        return vocabs.stream()
                .map(this::toVocabWithTagsDTO)
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

        List<VocabTagMapping> mappings = tagMappingRepository.findByVocabId(id);
        List<VocabTagDTO> tags = mappings.stream()
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

        Optional<Vocab> vocabOpt = vocabRepository.findById(id);
        if (vocabOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        VocabTag tag;

        // Find or create tag
        if (request.tagId() != null) {
            Optional<VocabTag> tagOpt = vocabTagService.getTagById(request.tagId());
            if (tagOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            tag = tagOpt.get();
        } else if (request.name() != null && !request.name().isBlank()) {
            // Find existing tag by name or create new one
            Optional<VocabTag> existingTag = vocabTagService.getTagByName(request.name());
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
        VocabTagMapping mapping = new VocabTagMapping(vocabOpt.get(), tag);
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

        VocabTagMapping mapping = tagMappingRepository.findByVocabIdAndTagId(id, tagId);
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

        List<Sentence> sentences = sentenceService.findByVocabId(id);
        List<SentenceSummaryDTO> dtos = sentences.stream()
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
        // Fetch tags for this vocab
        List<VocabTagMapping> mappings = tagMappingRepository.findByVocabId(vocab.getId());
        List<VocabTagDTO> tags = mappings.stream()
                .map(m -> new VocabTagDTO(
                        m.getTag().getId(),
                        m.getTag().getName(),
                        m.getTag().getCategory()))
                .toList();

        // Count sentences linked to this vocab
        int sentenceCount = sentenceService.findByVocabId(vocab.getId()).size();

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
