package com.qtihelper.demo.dto;

import com.qtihelper.demo.entity.WorksheetType;
import java.time.LocalDateTime;

/**
 * Projection interface for Worksheet entity to avoid loading large JSON content.
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
