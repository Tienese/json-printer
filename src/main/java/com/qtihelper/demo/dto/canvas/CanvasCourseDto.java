package com.qtihelper.demo.dto.canvas;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Canvas course data from API.
 * Represents minimal course data for dashboard display.
 * Maps to GET /api/v1/courses response.
 */
public record CanvasCourseDto(
    Long id,
    String name,
    @JsonProperty("course_code") String courseCode,
    @JsonProperty("workflow_state") String workflowState
) {}
