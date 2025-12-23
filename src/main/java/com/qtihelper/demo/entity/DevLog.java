package com.qtihelper.demo.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Dev Log Entity - Runtime assertion and event logging for AI-assisted
 * debugging.
 * Captures normal events, anomalies (expected != actual), and full state
 * snapshots.
 */
@Entity
@Table(name = "dev_logs")
public class DevLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private String level; // 'event', 'anomaly', 'error'

    @Column(nullable = false)
    private String component; // 'useWorksheet', 'WorksheetPage', etc.

    @Column(nullable = false)
    private String action; // 'ADD_ITEM', 'DELETE_PAGE', etc.

    @Column(length = 500)
    private String expected; // Expected outcome (for anomalies)

    @Column(length = 500)
    private String actual; // Actual outcome (for anomalies)

    @Column(length = 1000)
    private String message; // Human-readable description

    @Lob
    @Column(columnDefinition = "TEXT")
    private String stateSnapshot; // Full state JSON (for anomalies only)

    @Column(length = 500)
    private String userAgent; // Browser info

    // Constructors
    public DevLog() {
        this.timestamp = Instant.now();
    }

    public DevLog(String sessionId, String level, String component, String action) {
        this();
        this.sessionId = sessionId;
        this.level = level;
        this.component = component;
        this.action = action;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getComponent() {
        return component;
    }

    public void setComponent(String component) {
        this.component = component;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }

    public String getActual() {
        return actual;
    }

    public void setActual(String actual) {
        this.actual = actual;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStateSnapshot() {
        return stateSnapshot;
    }

    public void setStateSnapshot(String stateSnapshot) {
        this.stateSnapshot = stateSnapshot;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
