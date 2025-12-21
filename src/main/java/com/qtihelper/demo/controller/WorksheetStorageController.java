package com.qtihelper.demo.controller;

import com.qtihelper.demo.entity.Worksheet;
import com.qtihelper.demo.repository.WorksheetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for worksheet persistence operations.
 */
@RestController
@RequestMapping("/api/worksheets")
public class WorksheetStorageController {

    private final WorksheetRepository worksheetRepository;

    public WorksheetStorageController(WorksheetRepository worksheetRepository) {
        this.worksheetRepository = worksheetRepository;
    }

    /**
     * Get all saved worksheets.
     * GET /api/worksheets
     */
    @GetMapping
    public List<Worksheet> getAllWorksheets() {
        return worksheetRepository.findAllByOrderByUpdatedAtDesc();
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
}
