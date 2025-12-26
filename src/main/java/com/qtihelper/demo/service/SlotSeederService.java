package com.qtihelper.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.entity.SlotDefinition;
import com.qtihelper.demo.repository.SlotDefinitionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * Service to seed slot definitions from JSON file on startup.
 * Loads from: src/main/resources/data/slot_definitions.json
 */
@Service
public class SlotSeederService {

    private static final Logger log = LoggerFactory.getLogger(SlotSeederService.class);
    private static final String SLOT_DEFINITIONS_PATH = "data/slot_definitions.json";

    private final SlotDefinitionRepository slotRepository;
    private final ObjectMapper objectMapper;

    public SlotSeederService(SlotDefinitionRepository slotRepository) {
        this.slotRepository = slotRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void seedSlots() {
        // Only seed if table is empty
        if (slotRepository.count() > 0) {
            log.info("Slot definitions already exist, skipping seed");
            return;
        }

        try {
            ClassPathResource resource = new ClassPathResource(SLOT_DEFINITIONS_PATH);
            InputStream inputStream = resource.getInputStream();

            List<Map<String, Object>> slots = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Map<String, Object>>>() {
                    });

            for (Map<String, Object> slot : slots) {
                SlotDefinition entity = new SlotDefinition();
                entity.setName((String) slot.get("name"));
                entity.setParticles(objectMapper.writeValueAsString(slot.get("particles")));
                entity.setDescription((String) slot.get("description"));
                entity.setHumanTerm((String) slot.get("humanTerm"));
                entity.setQuestionWord((String) slot.get("questionWord"));
                entity.setLessonIntroduced((Integer) slot.get("lessonIntroduced"));

                slotRepository.save(entity);
            }

            log.info("Seeded {} slot definitions", slots.size());
        } catch (Exception e) {
            log.error("Failed to seed slot definitions: {}", e.getMessage());
        }
    }
}
