package com.qtihelper.demo.service;

import com.qtihelper.demo.entity.VocabTag;
import com.qtihelper.demo.repository.VocabTagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing vocabulary semantic tags.
 * Provides CRUD operations for the Language Coach tag system.
 */
@Service
public class VocabTagService {

    private final VocabTagRepository tagRepository;

    public VocabTagService(VocabTagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    /**
     * Get all tags, optionally filtered by category.
     */
    public List<VocabTag> getAllTags(String category) {
        if (category != null && !category.isBlank()) {
            return tagRepository.findByCategory(category);
        }
        return tagRepository.findAll();
    }

    /**
     * Get a tag by ID.
     */
    public Optional<VocabTag> getTagById(Long id) {
        return tagRepository.findById(id);
    }

    /**
     * Get a tag by name.
     */
    public Optional<VocabTag> getTagByName(String name) {
        return tagRepository.findByName(name);
    }

    /**
     * Create a new tag.
     */
    @Transactional
    public VocabTag createTag(String name, String category, String description, String examples) {
        if (tagRepository.existsByName(name)) {
            throw new IllegalArgumentException("Tag with name '" + name + "' already exists");
        }

        VocabTag tag = new VocabTag(name, category, description);
        tag.setExamples(examples);
        return tagRepository.save(tag);
    }

    /**
     * Update an existing tag.
     */
    @Transactional
    public VocabTag updateTag(Long id, String name, String category, String description, String examples) {
        VocabTag tag = tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id));

        // Check if name is being changed and already exists
        if (!tag.getName().equals(name) && tagRepository.existsByName(name)) {
            throw new IllegalArgumentException("Tag with name '" + name + "' already exists");
        }

        tag.setName(name);
        tag.setCategory(category);
        tag.setDescription(description);
        tag.setExamples(examples);
        return tagRepository.save(tag);
    }

    /**
     * Delete a tag by ID.
     */
    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new IllegalArgumentException("Tag not found: " + id);
        }
        tagRepository.deleteById(id);
    }

    /**
     * Seed default N5 semantic tags if not already present.
     */
    @Transactional
    public void seedDefaultTags() {
        seedTagIfMissing("transport", "semantic", "Vehicles and transportation", "車, バス, 電車, 自転車");
        seedTagIfMissing("tool", "semantic", "Tools and utensils", "スプーン, はさみ, ナイフ, ペン");
        seedTagIfMissing("food", "semantic", "Food and drinks", "りんご, パン, 水, ごはん");
        seedTagIfMissing("person", "semantic", "People and occupations", "先生, 学生, 友達, 医者");
        seedTagIfMissing("animal", "semantic", "Animals", "犬, 猫, 鳥, 魚");
        seedTagIfMissing("place", "semantic", "Places and locations", "学校, 駅, 家, 病院");
        seedTagIfMissing("time", "semantic", "Time-related words", "今日, 明日, 朝, 夜");
        seedTagIfMissing("pronoun", "grammar_role", "Pronouns", "わたし, あなた, かれ, かのじょ");
        seedTagIfMissing("honorific", "grammar_role", "Honorific suffixes", "さん, くん, ちゃん, 様");
        seedTagIfMissing("counter", "grammar_role", "Counter words", "つ, 本, 枚, 匹");
    }

    private void seedTagIfMissing(String name, String category, String description, String examples) {
        if (!tagRepository.existsByName(name)) {
            VocabTag tag = new VocabTag(name, category, description);
            tag.setExamples(examples);
            tagRepository.save(tag);
        }
    }
}
