package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.quiz.UserQuizJson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Orchestration service for the complete QTI import workflow.
 * Coordinates: JSON parsing → QTI generation → ZIP creation → Canvas upload
 */
@Service
public class QuizImportManager {

    private static final Logger log = LoggerFactory.getLogger(QuizImportManager.class);

    private final ManifestGeneratorService manifestGenerator;
    private final QtiContentGeneratorService qtiContentGenerator;
    private final ZipArchiveService zipArchiveService;
    private final CanvasMigrationService canvasMigrationService;

    public QuizImportManager(ManifestGeneratorService manifestGenerator,
                            QtiContentGeneratorService qtiContentGenerator,
                            ZipArchiveService zipArchiveService,
                            CanvasMigrationService canvasMigrationService) {
        this.manifestGenerator = manifestGenerator;
        this.qtiContentGenerator = qtiContentGenerator;
        this.zipArchiveService = zipArchiveService;
        this.canvasMigrationService = canvasMigrationService;
    }

    /**
     * Complete workflow: Process quiz and import to Canvas.
     *
     * @param quiz     UserQuizJson object containing quiz data
     * @param courseId Canvas course ID for import
     * @return Result message with import status
     */
    public ImportResult processAndImport(UserQuizJson quiz, String courseId) {
        log.info("=== Starting complete QTI import workflow ===");
        log.info("Quiz: {}, Course ID: {}", quiz.getTitle(), courseId);

        long startTime = System.currentTimeMillis();
        ImportResult result = new ImportResult();

        try {
            // Step 1: Generate IMS manifest
            log.info("Step 1/4: Generating IMS manifest");
            long step1Start = System.currentTimeMillis();
            String manifestXml = manifestGenerator.generateManifest(quiz.getTitle());
            long step1Duration = System.currentTimeMillis() - step1Start;
            log.info("Step 1/4: Manifest generated ({} bytes) in {}ms", manifestXml.length(), step1Duration);

            result.setManifestGenerated(true);
            result.setManifestSize(manifestXml.length());

            // Step 2: Generate QTI content
            log.info("Step 2/4: Generating QTI content XML");
            long step2Start = System.currentTimeMillis();
            String qtiContentXml = qtiContentGenerator.generateQtiContent(quiz);
            long step2Duration = System.currentTimeMillis() - step2Start;
            log.info("Step 2/4: QTI content generated ({} bytes) in {}ms", qtiContentXml.length(), step2Duration);

            result.setQtiContentGenerated(true);
            result.setQtiContentSize(qtiContentXml.length());
            result.setQuestionCount(quiz.getQuestions().size());

            // Step 3: Create ZIP package
            log.info("Step 3/4: Creating QTI package ZIP");
            long step3Start = System.currentTimeMillis();
            byte[] qtiZipBytes = zipArchiveService.createQtiPackage(manifestXml, qtiContentXml);
            long step3Duration = System.currentTimeMillis() - step3Start;
            log.info("Step 3/4: ZIP package created ({} bytes) in {}ms", qtiZipBytes.length, step3Duration);

            result.setZipCreated(true);
            result.setZipSize(qtiZipBytes.length);
            result.setQtiPackage(qtiZipBytes);

            // Step 4: Upload to Canvas
            log.info("Step 4/4: Uploading to Canvas and initiating migration");
            long step4Start = System.currentTimeMillis();
            String migrationStatus = canvasMigrationService.uploadAndMigrate(courseId, qtiZipBytes, quiz.getTitle());
            long step4Duration = System.currentTimeMillis() - step4Start;
            log.info("Step 4/4: Upload completed in {}ms", step4Duration);

            result.setCanvasUploadCompleted(true);
            result.setMigrationStatus(migrationStatus);

            // Final result
            long totalDuration = System.currentTimeMillis() - startTime;
            result.setSuccess(true);
            result.setTotalDurationMs(totalDuration);
            result.setMessage("QTI package successfully uploaded to Canvas. Check Canvas for import status.");

            log.info("=== QTI import workflow completed successfully in {}ms ===", totalDuration);
            log.info("Performance: Manifest={}ms, QTI={}ms, ZIP={}ms, Upload={}ms",
                    step1Duration, step2Duration, step3Duration, step4Duration);

            return result;

        } catch (IOException e) {
            log.error("=== QTI import workflow failed (IO error) ===", e);
            result.setSuccess(false);
            result.setMessage("Failed to create QTI package: " + e.getMessage());
            result.setError(e.getMessage());
            return result;

        } catch (Exception e) {
            log.error("=== QTI import workflow failed ===", e);
            result.setSuccess(false);
            result.setMessage("Import failed: " + e.getMessage());
            result.setError(e.getMessage());
            return result;
        }
    }

    /**
     * Generate QTI package only (without Canvas upload).
     *
     * @param quiz UserQuizJson object
     * @return QTI package as byte array
     */
    public byte[] generateQtiPackageOnly(UserQuizJson quiz) throws IOException {
        log.info("Generating QTI package (no upload) for quiz: {}", quiz.getTitle());

        // Generate manifest
        String manifestXml = manifestGenerator.generateManifest(quiz.getTitle());

        // Generate QTI content
        String qtiContentXml = qtiContentGenerator.generateQtiContent(quiz);

        // Create ZIP
        byte[] qtiZipBytes = zipArchiveService.createQtiPackage(manifestXml, qtiContentXml);

        log.info("QTI package generated ({} bytes)", qtiZipBytes.length);
        return qtiZipBytes;
    }

    /**
     * Result object for import workflow.
     */
    public static class ImportResult {
        private boolean success;
        private String message;
        private String error;

        private boolean manifestGenerated;
        private int manifestSize;

        private boolean qtiContentGenerated;
        private int qtiContentSize;
        private int questionCount;

        private boolean zipCreated;
        private int zipSize;
        private byte[] qtiPackage;

        private boolean canvasUploadCompleted;
        private String migrationStatus;

        private long totalDurationMs;

        // Getters and Setters

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public boolean isManifestGenerated() {
            return manifestGenerated;
        }

        public void setManifestGenerated(boolean manifestGenerated) {
            this.manifestGenerated = manifestGenerated;
        }

        public int getManifestSize() {
            return manifestSize;
        }

        public void setManifestSize(int manifestSize) {
            this.manifestSize = manifestSize;
        }

        public boolean isQtiContentGenerated() {
            return qtiContentGenerated;
        }

        public void setQtiContentGenerated(boolean qtiContentGenerated) {
            this.qtiContentGenerated = qtiContentGenerated;
        }

        public int getQtiContentSize() {
            return qtiContentSize;
        }

        public void setQtiContentSize(int qtiContentSize) {
            this.qtiContentSize = qtiContentSize;
        }

        public int getQuestionCount() {
            return questionCount;
        }

        public void setQuestionCount(int questionCount) {
            this.questionCount = questionCount;
        }

        public boolean isZipCreated() {
            return zipCreated;
        }

        public void setZipCreated(boolean zipCreated) {
            this.zipCreated = zipCreated;
        }

        public int getZipSize() {
            return zipSize;
        }

        public void setZipSize(int zipSize) {
            this.zipSize = zipSize;
        }

        public byte[] getQtiPackage() {
            return qtiPackage;
        }

        public void setQtiPackage(byte[] qtiPackage) {
            this.qtiPackage = qtiPackage;
        }

        public boolean isCanvasUploadCompleted() {
            return canvasUploadCompleted;
        }

        public void setCanvasUploadCompleted(boolean canvasUploadCompleted) {
            this.canvasUploadCompleted = canvasUploadCompleted;
        }

        public String getMigrationStatus() {
            return migrationStatus;
        }

        public void setMigrationStatus(String migrationStatus) {
            this.migrationStatus = migrationStatus;
        }

        public long getTotalDurationMs() {
            return totalDurationMs;
        }

        public void setTotalDurationMs(long totalDurationMs) {
            this.totalDurationMs = totalDurationMs;
        }
    }
}
