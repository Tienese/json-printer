package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.Worksheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Worksheet persistence operations.
 */
@Repository
public interface WorksheetRepository extends JpaRepository<Worksheet, Long> {

    /**
     * Find all worksheets ordered by most recently updated first.
     */
    List<Worksheet> findAllByOrderByUpdatedAtDesc();

    /**
     * Find all worksheet summaries (excluding jsonContent) ordered by most recently updated first.
     */
    List<WorksheetSummary> findSummaryByOrderByUpdatedAtDesc();

    List<Worksheet> findByNameContainingIgnoreCase(String name);

    /**
     * Find worksheets by type (SNAPSHOT, AUTOSAVE, TEMPLATE).
     */
    List<Worksheet> findByTypeOrderByUpdatedAtDesc(com.qtihelper.demo.entity.WorksheetType type);

    /**
     * Find worksheet summaries by type.
     */
    List<WorksheetSummary> findSummaryByTypeOrderByUpdatedAtDesc(com.qtihelper.demo.entity.WorksheetType type);

    /**
     * Find all autosaves for a specific parent worksheet.
     */
    List<Worksheet> findByParentIdOrderByUpdatedAtDesc(Long parentId);

    /**
     * Find IDs of worksheets by parent ID, used for efficient cleanup.
     */
    @org.springframework.data.jpa.repository.Query("SELECT w.id FROM Worksheet w WHERE w.parentId = :parentId ORDER BY w.updatedAt DESC")
    List<Long> findIdsByParentIdOrderByUpdatedAtDesc(Long parentId);
}
