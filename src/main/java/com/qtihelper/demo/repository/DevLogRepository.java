package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.DevLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for DevLog persistence operations.
 * Supports querying by level, session, and time range for AI-assisted
 * debugging.
 */
@Repository
public interface DevLogRepository extends JpaRepository<DevLog, Long> {

    /**
     * Find logs by level (event, anomaly, error) ordered by most recent first.
     */
    List<DevLog> findByLevelOrderByTimestampDesc(String level);

    /**
     * Find all logs for a specific session, ordered chronologically.
     */
    List<DevLog> findBySessionIdOrderByTimestampAsc(String sessionId);

    /**
     * Find logs after a specific timestamp, ordered by most recent first.
     */
    List<DevLog> findByTimestampAfterOrderByTimestampDesc(Instant since);

    /**
     * Find anomalies and errors only, ordered by most recent first.
     */
    @Query("SELECT d FROM DevLog d WHERE d.level IN ('anomaly', 'error') ORDER BY d.timestamp DESC")
    List<DevLog> findAnomalies();

    /**
     * Find recent logs (last N entries).
     */
    List<DevLog> findTop100ByOrderByTimestampDesc();
}
