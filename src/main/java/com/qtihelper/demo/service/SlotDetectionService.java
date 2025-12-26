package com.qtihelper.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.SlotAssignment;
import com.qtihelper.demo.entity.SlotDefinition;
import com.qtihelper.demo.repository.SlotDefinitionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for detecting grammatical slots based on particles.
 * Analyzes tokenized Japanese text to identify slot assignments.
 */
@Service
public class SlotDetectionService {

    private static final Logger log = LoggerFactory.getLogger(SlotDetectionService.class);

    private final SlotDefinitionRepository slotRepository;
    private final ObjectMapper objectMapper;

    // Cache of particle -> slot name mappings
    private Map<String, String> particleToSlotMap;

    public SlotDetectionService(SlotDefinitionRepository slotRepository) {
        this.slotRepository = slotRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Detect slot assignments from a list of tokens.
     * Looks for particles and maps preceding words to slots.
     *
     * @param tokens    List of token results with surface, baseForm, and POS
     * @param itemIndex The worksheet item index for location tracking
     * @return List of slot assignments
     */
    public List<SlotAssignment> detectSlots(List<SudachiTokenizerService.TokenResult> tokens, int itemIndex) {
        ensureParticleMapLoaded();

        List<SlotAssignment> assignments = new ArrayList<>();

        for (int i = 0; i < tokens.size(); i++) {
            SudachiTokenizerService.TokenResult token = tokens.get(i);

            // Check if this token is a particle
            if (token.pos() != null && token.pos().startsWith("助詞")) {
                String particle = token.surface();
                String slotName = particleToSlotMap.get(particle);

                if (slotName != null && i > 0) {
                    // The word before the particle fills the slot
                    SudachiTokenizerService.TokenResult markedWord = tokens.get(i - 1);

                    assignments.add(new SlotAssignment(
                            markedWord.baseForm(),
                            slotName,
                            particle,
                            i - 1,
                            itemIndex));

                    log.debug("Detected slot: {} fills {} (particle: {})",
                            markedWord.baseForm(), slotName, particle);
                }
            }
        }

        return assignments;
    }

    /**
     * Get slot analysis summary: slots used and missing.
     */
    public SlotAnalysisSummary analyzeSlotUsage(List<SlotAssignment> assignments) {
        Map<String, Integer> slotCounts = new HashMap<>();
        Map<String, List<String>> slotWords = new HashMap<>();

        for (SlotAssignment assignment : assignments) {
            slotCounts.merge(assignment.slotName(), 1, Integer::sum);
            slotWords.computeIfAbsent(assignment.slotName(), k -> new ArrayList<>())
                    .add(assignment.word());
        }

        // Find missing slots
        List<String> missingSlotsNames = new ArrayList<>();
        List<SlotDefinition> allSlots = slotRepository.findAll();
        for (SlotDefinition slot : allSlots) {
            if (!slotCounts.containsKey(slot.getName())) {
                missingSlotsNames.add(slot.getName());
            }
        }

        return new SlotAnalysisSummary(slotCounts, slotWords, missingSlotsNames);
    }

    /**
     * Generate human-readable summary of slot usage.
     */
    public String generateSlotSummary(SlotAnalysisSummary analysis) {
        if (analysis.slotCounts().isEmpty()) {
            return "No grammatical patterns detected.";
        }

        StringBuilder sb = new StringBuilder("Your worksheet asks ");

        List<String> usedParts = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : analysis.slotCounts().entrySet()) {
            String humanTerm = getHumanTerm(entry.getKey());
            usedParts.add(String.format("%s (%dx)", humanTerm, entry.getValue()));
        }
        sb.append(String.join(", ", usedParts));

        if (!analysis.missingSlots().isEmpty()) {
            List<String> missingTerms = new ArrayList<>();
            for (String slot : analysis.missingSlots()) {
                missingTerms.add(getHumanTerm(slot));
            }
            sb.append(" but never ");
            sb.append(String.join(" or ", missingTerms.subList(0, Math.min(3, missingTerms.size()))));
        }

        return sb.toString();
    }

    private String getHumanTerm(String slotName) {
        return slotRepository.findByName(slotName)
                .map(SlotDefinition::getHumanTerm)
                .orElse(slotName);
    }

    private void ensureParticleMapLoaded() {
        if (particleToSlotMap != null) {
            return;
        }

        particleToSlotMap = new HashMap<>();
        List<SlotDefinition> slots = slotRepository.findAll();

        for (SlotDefinition slot : slots) {
            try {
                List<String> particles = objectMapper.readValue(
                        slot.getParticles(),
                        new TypeReference<List<String>>() {
                        });
                for (String particle : particles) {
                    // Default mappings for ambiguous particles (per spec)
                    // で → LOCATION, に → DIRECTION
                    if (!particleToSlotMap.containsKey(particle)) {
                        particleToSlotMap.put(particle, slot.getName());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse particles for slot {}: {}", slot.getName(), e.getMessage());
            }
        }

        log.info("Loaded {} particle-to-slot mappings", particleToSlotMap.size());
    }

    /**
     * Summary of slot analysis results.
     */
    public record SlotAnalysisSummary(
            Map<String, Integer> slotCounts,
            Map<String, List<String>> slotWords,
            List<String> missingSlots) {
    }
}
