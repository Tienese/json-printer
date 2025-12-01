package com.qtihelper.demo.service;

import com.qtihelper.demo.config.CanvasProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class CanvasUploader {

  private static final Logger log = LoggerFactory.getLogger(CanvasUploader.class);
  private final RestClient restClient;

  public CanvasUploader(CanvasProperties props, RestClient.Builder builder) {
    this.restClient = builder
        .baseUrl(props.url())
        .defaultHeader("Authorization", "Bearer " + props.token())
        .build();
  }

  public boolean uploadAndMigrate(String courseId, String quizTitle, Path zipFile) {
    try {
      log.info("Initiating migration for course: {}", courseId);
      Map<String, Object> initResponse = restClient.post()
          .uri("/api/v1/courses/{id}/content_migrations", courseId)
          .contentType(MediaType.APPLICATION_FORM_URLENCODED)
          .body("migration_type=canvas_cartridge_importer&pre_attachment[name]=" + 
                zipFile.getFileName() + "&pre_attachment[size]=" + Files.size(zipFile))
          .retrieve()
          .body(Map.class); 

      if (initResponse == null) return false;

      @SuppressWarnings("unchecked")
      Map<String, Object> preAttachment = (Map<String, Object>) initResponse.get("pre_attachment");
      String uploadUrl = (String) preAttachment.get("upload_url");
      
      @SuppressWarnings("unchecked")
      Map<String, String> uploadParams = (Map<String, String>) preAttachment.get("upload_params");

      log.info("Uploading file content...");
      uploadFileToS3(uploadUrl, uploadParams, zipFile);

      // Basic polling logic placeholder (for brevity, assuming async process starts)
      log.info("Migration started successfully. Check Canvas for completion status.");
      
      return true;

    } catch (Exception e) {
      log.error("Upload failed", e);
      return false;
    }
  }

  private void uploadFileToS3(String url, Map<String, String> params, Path file) {
    MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
    params.forEach(bodyBuilder::part);
    bodyBuilder.part("file", new FileSystemResource(file));

    // Create a fresh client for S3/Upload URL as it doesn't use the Canvas Bearer token
    RestClient.create().post()
        .uri(url)
        .contentType(MediaType.MULTIPART_FORM_DATA)
        .body(bodyBuilder.build())
        .retrieve()
        .toBodilessEntity();
  }
}