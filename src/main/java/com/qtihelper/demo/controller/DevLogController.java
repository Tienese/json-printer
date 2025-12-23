package com.qtihelper.demo.controller;

import com.qtihelper.demo.dto.DevLogDTO;
import com.qtihelper.demo.entity.DevLog;
import com.qtihelper.demo.repository.DevLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Dev Logging.
 * Provides endpoints for ingesting logs from frontend and querying for AI
 * debugging.
 */
@RestController
@RequestMapping("/api/dev")
@CrossOrigin(origins = "*") // Allow frontend during development
public class DevLogController {

    private final DevLogRepository repository;

    public DevLogController(DevLogRepository repository) {
        this.repository = repository;
    }

    /**
     * POST /api/dev/log
     * Ingest a new log entry from frontend.
     */
    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> createLog(@RequestBody DevLogDTO dto) {
        try {
            DevLog log = new DevLog(dto.sessionId(), dto.level(), dto.component(), dto.action());
            log.setExpected(dto.expected());
            log.setActual(dto.actual());
            log.setMessage(dto.message());
            log.setStateSnapshot(dto.stateSnapshot());
            log.setUserAgent(dto.userAgent());

            DevLog saved = repository.save(log);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", saved.getId(),
                    "timestamp", saved.getTimestamp().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * GET /api/dev/logs
     * Query all recent logs (last 100).
     */
    @GetMapping("/logs")
    public ResponseEntity<List<DevLog>> getAllLogs() {
        List<DevLog> logs = repository.findTop100ByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
    }

    /**
     * GET /api/dev/logs/anomalies
     * Get only anomalies and errors.
     */
    @GetMapping("/logs/anomalies")
    public ResponseEntity<List<DevLog>> getAnomalies() {
        List<DevLog> anomalies = repository.findAnomalies();
        return ResponseEntity.ok(anomalies);
    }

    /**
     * GET /api/dev/logs/level/{level}
     * Filter logs by level (event, anomaly, error).
     */
    @GetMapping("/logs/level/{level}")
    public ResponseEntity<List<DevLog>> getLogsByLevel(@PathVariable String level) {
        List<DevLog> logs = repository.findByLevelOrderByTimestampDesc(level);
        return ResponseEntity.ok(logs);
    }

    /**
     * GET /api/dev/logs/session/{sessionId}
     * Get all logs for a specific session (chronologically).
     */
    @GetMapping("/logs/session/{sessionId}")
    public ResponseEntity<List<DevLog>> getLogsBySession(@PathVariable String sessionId) {
        List<DevLog> logs = repository.findBySessionIdOrderByTimestampAsc(sessionId);
        return ResponseEntity.ok(logs);
    }

    /**
     * GET /api/dev/logs/since/{timestamp}
     * Get logs after a specific ISO timestamp.
     */
    @GetMapping("/logs/since/{timestamp}")
    public ResponseEntity<List<DevLog>> getLogsSince(@PathVariable String timestamp) {
        try {
            Instant since = Instant.parse(timestamp);
            List<DevLog> logs = repository.findByTimestampAfterOrderByTimestampDesc(since);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE /api/dev/logs
     * Clear all dev logs (use with caution).
     */
    @DeleteMapping("/logs")
    public ResponseEntity<Map<String, Object>> clearLogs() {
        long count = repository.count();
        repository.deleteAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "deletedCount", count));
    }

    /**
     * GET /api/dev/stats
     * Get summary statistics about dev logs.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total = repository.count();
        long anomalies = repository.findAnomalies().size();

        return ResponseEntity.ok(Map.of(
                "totalLogs", total,
                "anomalyCount", anomalies,
                "eventCount", total - anomalies));
    }
}
