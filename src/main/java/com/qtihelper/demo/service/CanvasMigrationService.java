package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.core.ParameterizedTypeReference;
import com.qtihelper.demo.exception.CanvasApiException;
import java.util.Map;
import java.util.Objects;

/**
 * Service for uploading QTI packages to Canvas and initiating content
 * migrations.
 */
@Service
public class CanvasMigrationService {

    private static final Logger log = LoggerFactory.getLogger(CanvasMigrationService.class);

    private final CanvasProperties canvasProperties;
    private final RestClient restClient;

    public CanvasMigrationService(CanvasProperties canvasProperties) {
        this.canvasProperties = canvasProperties;
        String baseUrl = canvasProperties.url();
        if (baseUrl == null) {
            throw new IllegalStateException("Canvas URL must be configured");
        }
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Upload QTI package to Canvas and initiate content migration.
     *
     * @param courseId    Canvas course ID
     * @param qtiZipBytes QTI package ZIP file bytes
     * @param quizTitle   Title for the question bank
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
            String uploadResult = uploadQtiPackage(migrationData, qtiZipBytes);

            log.info("=== Canvas migration completed successfully ===");
            return uploadResult;

        } catch (CanvasApiException e) {
            // Re-throw domain exceptions without wrapping
            throw e;
        } catch (Exception e) {
            // Rethrow with context - caller is responsible for logging
            throw new CanvasApiException("Canvas migration failed for course " + courseId + ": " + e.getMessage(), e);
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
            String token = canvasProperties.token();
            if (token == null) {
                throw new IllegalStateException("Canvas token must be configured");
            }
            Map<String, Object> response = restClient.post()
                    .uri(url != null ? url : "")
                    .header("Authorization", "Bearer " + token)
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_FORM_URLENCODED))
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            log.debug("Migration initiated, response: {}", response);

            if (response == null || !response.containsKey("pre_attachment")) {
                throw new CanvasApiException("Invalid migration response: missing pre_attachment");
            }

            Map<String, Object> preAttachment = (Map<String, Object>) response.get("pre_attachment");
            log.info("Migration ID: {}", response.get("id"));
            log.info("Upload URL: {}", preAttachment.get("upload_url"));

            return preAttachment;

        } catch (CanvasApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CanvasApiException(
                    "Failed to initiate Canvas migration for course " + courseId + ": " + e.getMessage(), e);
        }
    }

    /**
     * Upload QTI package to Canvas using the provided upload parameters.
     */
    @SuppressWarnings("unchecked")
    private String uploadQtiPackage(Map<String, Object> uploadParams, byte[] qtiZipBytes) {
        String uploadUrl = (String) uploadParams.get("upload_url");
        Map<String, Object> uploadFields = (Map<String, Object>) uploadParams.get("upload_params");

        if (uploadUrl == null) {
            throw new CanvasApiException("Missing upload_url in migration response");
        }

        log.debug("Uploading to: {}", uploadUrl);

        try {
            // Build multipart form data
            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();

            // Add upload fields from Canvas
            if (uploadFields != null) {
                uploadFields.forEach(form::add);
            }

            // Add file
            byte[] fileBytes = qtiZipBytes != null ? qtiZipBytes : new byte[0];
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return "qti_package.zip";
                }
            };

            form.add("file", fileResource);

            // Upload
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

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
            throw new CanvasApiException("Failed to upload QTI package to Canvas: " + e.getMessage(), e);
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
            String token = canvasProperties.token();
            if (token == null) {
                return "error: token missing";
            }

            @SuppressWarnings({ "unchecked", "null" })
            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .header("Authorization", "Bearer " + Objects.requireNonNull(token, "Token must not be null"))
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
