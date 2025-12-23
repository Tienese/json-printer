package com.qtihelper.demo.dto;

import com.qtihelper.demo.entity.WorksheetType;
import java.time.LocalDateTime;

/**
 * Projection interface for Worksheet summaries (excluding heavy jsonContent).
 */
public interface WorksheetSummary {
    Long getId();
    String getName();
    WorksheetType getType();
    Long getParentId();
    String getMetadata();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
}
