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

    List<Worksheet> findByNameContainingIgnoreCase(String name);

    /**
     * Find worksheets by type (SNAPSHOT, AUTOSAVE, TEMPLATE).
     */
    List<Worksheet> findByTypeOrderByUpdatedAtDesc(com.qtihelper.demo.entity.WorksheetType type);

    /**
     * Find all autosaves for a specific parent worksheet.
     */
    List<Worksheet> findByParentIdOrderByUpdatedAtDesc(Long parentId);
}
