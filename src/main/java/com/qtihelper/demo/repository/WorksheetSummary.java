package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.WorksheetType;
import java.time.LocalDateTime;

/**
 * Projection interface for Worksheet entity to exclude heavy jsonContent.
 */
public interface WorksheetSummary {
    Long getId();
    String getName();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
    WorksheetType getType();
    Long getParentId();
    String getMetadata();
}
