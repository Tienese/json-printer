package com.qtihelper.demo.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qtihelper.demo.dto.StyleCheckResult;
import com.qtihelper.demo.dto.VocabAnalysisResult;
import com.qtihelper.demo.entity.Worksheet;
import com.qtihelper.demo.entity.WorksheetType;
import com.qtihelper.demo.repository.WorksheetRepository;
import com.qtihelper.demo.service.StyleCheckService;
import com.qtihelper.demo.service.WorksheetAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for worksheet persistence operations.
 */
@RestController
@RequestMapping("/api/worksheets")
public class WorksheetStorageController {

    private static final Logger log = LoggerFactory.getLogger(WorksheetStorageController.class);

    private final WorksheetRepository worksheetRepository;
    private final WorksheetAnalysisService analysisService;
    private final StyleCheckService styleCheckService;
    private final ObjectMapper objectMapper;
    private static final int MAX_AUTOSAVES = 10;

    public WorksheetStorageController(
            WorksheetRepository worksheetRepository,
            WorksheetAnalysisService analysisService,
            StyleCheckService styleCheckService,
            ObjectMapper objectMapper) {
        this.worksheetRepository = worksheetRepository;
        this.analysisService = analysisService;
        this.styleCheckService = styleCheckService;
        this.objectMapper = objectMapper;
    }

    /**
     * Get all saved worksheets, optionally filtered by type.
     * GET /api/worksheets?type=SNAPSHOT
     */
    @GetMapping
    public List<Worksheet> getAllWorksheets(@RequestParam(required = false) WorksheetType type) {
        if (type != null) {
            return worksheetRepository.findByTypeOrderByUpdatedAtDesc(type);
        }
        return worksheetRepository.findAllByOrderByUpdatedAtDesc();
    }

    /**
     * Get all templates.
     * GET /api/templates
     */
    @GetMapping("/templates")
    public List<Worksheet> getTemplates() {
        return worksheetRepository.findByTypeOrderByUpdatedAtDesc(WorksheetType.TEMPLATE);
    }

    /**
     * Get a specific worksheet by ID.
     * GET /api/worksheets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Worksheet> getWorksheet(@PathVariable Long id) {
        return worksheetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Save a new worksheet.
     * POST /api/worksheets
     */
    @PostMapping
    public Worksheet createWorksheet(@RequestBody Worksheet worksheet) {
        return worksheetRepository.save(worksheet);
    }

    /**
     * Create or replace autosave for a parent worksheet.
     * POST /api/worksheets/{id}/autosave
     * Maintains max 10 autosaves per parent.
     */
    @PostMapping("/{id}/autosave")
    public Worksheet createAutosave(@PathVariable Long id, @RequestBody Worksheet autosave) {
        autosave.setType(WorksheetType.AUTOSAVE);
        autosave.setParentId(id);

        // Save new autosave
        Worksheet saved = worksheetRepository.save(autosave);

        // Cleanup: Keep only latest 10 autosaves for this parent
        List<Worksheet> autosaves = worksheetRepository.findByParentIdOrderByUpdatedAtDesc(id);
        if (autosaves.size() > MAX_AUTOSAVES) {
            for (int i = MAX_AUTOSAVES; i < autosaves.size(); i++) {
                worksheetRepository.delete(autosaves.get(i));
            }
        }

        return saved;
    }

    /**
     * Create a named snapshot from a parent worksheet.
     * POST /api/worksheets/{id}/snapshot
     */
    @PostMapping("/{id}/snapshot")
    public Worksheet createSnapshot(@PathVariable Long id, @RequestBody Worksheet snapshot) {
        snapshot.setType(WorksheetType.SNAPSHOT);
        snapshot.setParentId(null); // Snapshots are standalone
        return worksheetRepository.save(snapshot);
    }

    /**
     * Duplicate a worksheet.
     * POST /api/worksheets/{id}/duplicate
     */
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Worksheet> duplicateWorksheet(@PathVariable Long id) {
        return worksheetRepository.findById(id)
                .map(original -> {
                    Worksheet copy = new Worksheet(
                            original.getName() + " (Copy)",
                            original.getJsonContent(),
                            WorksheetType.SNAPSHOT,
                            null,
                            original.getMetadata());
                    return ResponseEntity.ok(worksheetRepository.save(copy));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing worksheet.
     * PUT /api/worksheets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Worksheet> updateWorksheet(
            @PathVariable Long id,
            @RequestBody Worksheet updatedWorksheet) {

        return worksheetRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedWorksheet.getName());
                    existing.setJsonContent(updatedWorksheet.getJsonContent());
                    existing.setMetadata(updatedWorksheet.getMetadata());
                    return ResponseEntity.ok(worksheetRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a worksheet.
     * DELETE /api/worksheets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorksheet(@PathVariable Long id) {
        if (worksheetRepository.existsById(id)) {
            worksheetRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ===== STYLE CHECK ENDPOINTS =====

    /**
     * Check worksheet for style issues.
     * POST /api/worksheets/{id}/check-style
     *
     * Response: StyleCheckResult JSON with issues list and score
     */
    @PostMapping("/{id}/check-style")
    public ResponseEntity<StyleCheckResult> checkStyle(@PathVariable Long id) {
        log.info("Checking style for worksheet {}", id);

        return worksheetRepository.findById(id)
                .map(worksheet -> {
                    StyleCheckResult result = styleCheckService.check(worksheet.getJsonContent());
                    log.info("Style check complete for worksheet {}: score={}, issues={}",
                            id, result.score(), result.issues().size());
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ===== VOCABULARY ANALYSIS ENDPOINTS =====

    /**
     * Analyze worksheet vocabulary coverage against target lesson(s).
     * POST /api/worksheets/{id}/analyze
     *
     * Request body: { "lessonIds": [1, 2, 3] }
     * Response: VocabAnalysisResult JSON with coverage stats and missing words
     */
    @PostMapping("/{id}/analyze")
    public ResponseEntity<VocabAnalysisResult> analyzeWorksheet(
            @PathVariable Long id,
            @RequestBody AnalyzeRequest request) {

        log.info("Analyzing worksheet {} for lessons: {}", id, request.lessonIds());

        return worksheetRepository.findById(id)
                .map(worksheet -> {
                    // Run analysis
                    VocabAnalysisResult result = analysisService.analyze(
                            worksheet.getJsonContent(),
                            request.lessonIds());

                    // Cache result in metadata
                    String updatedMetadata = cacheAnalysisResult(worksheet.getMetadata(), result);
                    worksheet.setMetadata(updatedMetadata);
                    worksheetRepository.save(worksheet);

                    log.info("Analysis complete for worksheet {}: {}% coverage",
                            id, result.coveragePercent());

                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Request body for analyze endpoint.
     */
    public record AnalyzeRequest(List<Integer> lessonIds) {
    }

    /**
     * Cache analysis result in worksheet metadata JSON.
     */
    private String cacheAnalysisResult(String existingMetadata, VocabAnalysisResult result) {
        try {
            // Parse existing metadata or create new object
            var metadataNode = existingMetadata != null && !existingMetadata.isBlank()
                    ? objectMapper.readTree(existingMetadata)
                    : objectMapper.createObjectNode();

            // Add analysis cache
            var objectNode = (com.fasterxml.jackson.databind.node.ObjectNode) metadataNode;
            objectNode.set("analysisCache", objectMapper.valueToTree(result));

            return objectMapper.writeValueAsString(objectNode);
        } catch (JsonProcessingException e) {
            log.error("Failed to cache analysis result: {}", e.getMessage());
            return existingMetadata;
        }
    }
}
