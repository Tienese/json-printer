package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Service for uploading QTI packages to Canvas and initiating content migrations.
 */
@Service
public class CanvasMigrationService {

    private static final Logger log = LoggerFactory.getLogger(CanvasMigrationService.class);

    private final CanvasProperties canvasProperties;
    private final RestClient restClient;

    public CanvasMigrationService(CanvasProperties canvasProperties) {
        this.canvasProperties = canvasProperties;
        this.restClient = RestClient.builder()
                .baseUrl(canvasProperties.url())
                .build();
    }

    /**
     * Upload QTI package to Canvas and initiate content migration.
     *
     * @param courseId  Canvas course ID
     * @param qtiZipBytes QTI package ZIP file bytes
     * @param quizTitle Title for the question bank
     * @return Migration ID or status message
     */
    public String uploadAndMigrate(String courseId, byte[] qtiZipBytes, String quizTitle) {
        log.info("=== Starting Canvas migration for course {} ===", courseId);
        log.info("QTI package size: {} bytes", qtiZipBytes.length);

        try {
            // Step 1: Initiate migration and get upload parameters
            log.info("Step 1: Initiating content migration");
            Map<String, Object> migrationData = initiateMigration(courseId);

            // Step 2: Upload the file
            log.info("Step 2: Uploading QTI package");
            String uploadResult = uploadQtiPackage(migrationData, qtiZipBytes, quizTitle);

            log.info("=== Canvas migration completed successfully ===");
            return uploadResult;

        } catch (Exception e) {
            log.error("=== Canvas migration failed ===", e);
            throw new RuntimeException("Failed to upload QTI package to Canvas: " + e.getMessage(), e);
        }
    }

    /**
     * Initiate a content migration to get upload parameters.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> initiateMigration(String courseId) {
        String url = String.format("/api/v1/courses/%s/content_migrations", courseId);

        log.debug("POST {}", url);

        // Request body for migration
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("migration_type", "qti_converter");

        // Pre-attachment parameters to request upload URL
        body.add("pre_attachment[name]", "qti_package.zip");
        body.add("pre_attachment[size]", "1048576"); // Placeholder size

        try {
            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .header("Authorization", "Bearer " + canvasProperties.token())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            log.debug("Migration initiated, response: {}", response);

            if (response == null || !response.containsKey("pre_attachment")) {
                throw new RuntimeException("Invalid migration response: missing pre_attachment");
            }

            Map<String, Object> preAttachment = (Map<String, Object>) response.get("pre_attachment");
            log.info("Migration ID: {}", response.get("id"));
            log.info("Upload URL: {}", preAttachment.get("upload_url"));

            return preAttachment;

        } catch (Exception e) {
            log.error("Failed to initiate migration", e);
            throw new RuntimeException("Failed to initiate Canvas migration: " + e.getMessage(), e);
        }
    }

    /**
     * Upload QTI package to Canvas using the provided upload parameters.
     */
    @SuppressWarnings("unchecked")
    private String uploadQtiPackage(Map<String, Object> uploadParams, byte[] qtiZipBytes, String filename) {
        String uploadUrl = (String) uploadParams.get("upload_url");
        Map<String, Object> uploadFields = (Map<String, Object>) uploadParams.get("upload_params");

        if (uploadUrl == null) {
            throw new RuntimeException("Missing upload_url in migration response");
        }

        log.debug("Uploading to: {}", uploadUrl);

        try {
            // Build multipart form data
            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();

            // Add upload fields from Canvas
            if (uploadFields != null) {
                uploadFields.forEach((key, value) -> form.add(key, value));
            }

            // Add file
            ByteArrayResource fileResource = new ByteArrayResource(qtiZipBytes) {
                @Override
                public String getFilename() {
                    return "qti_package.zip";
                }
            };

            form.add("file", fileResource);

            // Upload
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(form, headers);

            RestClient uploadClient = RestClient.builder().build();
            String response = uploadClient.post()
                    .uri(uploadUrl)
                    .body(form)
                    .retrieve()
                    .body(String.class);

            log.info("Upload completed successfully");
            log.debug("Upload response: {}", response);

            return "Migration initiated successfully. Check Canvas for import status.";

        } catch (Exception e) {
            log.error("Failed to upload QTI package", e);
            throw new RuntimeException("Failed to upload file to Canvas: " + e.getMessage(), e);
        }
    }

    /**
     * Check migration status.
     *
     * @param courseId    Canvas course ID
     * @param migrationId Migration ID from Canvas
     * @return Migration status
     */
    public String checkMigrationStatus(String courseId, String migrationId) {
        String url = String.format("/api/v1/courses/%s/content_migrations/%s", courseId, migrationId);

        log.debug("GET {}", url);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .header("Authorization", "Bearer " + canvasProperties.token())
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("workflow_state")) {
                String status = (String) response.get("workflow_state");
                log.info("Migration {} status: {}", migrationId, status);
                return status;
            }

            return "unknown";

        } catch (Exception e) {
            log.error("Failed to check migration status", e);
            return "error: " + e.getMessage();
        }
    }
}
