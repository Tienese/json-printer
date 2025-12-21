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
    private final QtiMetaGeneratorService qtiMetaGenerator;
    private final ZipArchiveService zipArchiveService;
    private final CanvasMigrationService canvasMigrationService;

    public QuizImportManager(ManifestGeneratorService manifestGenerator,
            QtiContentGeneratorService qtiContentGenerator,
            QtiMetaGeneratorService qtiMetaGenerator,
            ZipArchiveService zipArchiveService,
            CanvasMigrationService canvasMigrationService) {
        this.manifestGenerator = manifestGenerator;
        this.qtiContentGenerator = qtiContentGenerator;
        this.qtiMetaGenerator = qtiMetaGenerator;
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
            // Step 1: Generate QTI content (to get assessment ID)
            log.info("Step 1/5: Generating QTI content XML");
            long step1Start = System.currentTimeMillis();
            QtiContentGeneratorService.QtiGenerationResult qtiResult = qtiContentGenerator.generateQtiContent(quiz);
            String assessmentId = qtiResult.assessmentIdent();
            String qtiContentXml = qtiResult.content();
            long step1Duration = System.currentTimeMillis() - step1Start;
            log.info("Step 1/5: QTI content generated ({} bytes) in {}ms", qtiContentXml.length(), step1Duration);

            result.setQtiContentGenerated(true);
            result.setQtiContentSize(qtiContentXml.length());
            result.setQuestionCount(quiz.getQuestions().size());

            // Step 2: Generate Canvas assessment metadata
            log.info("Step 2/5: Generating assessment metadata");
            long step2Start = System.currentTimeMillis();
            String assessmentMetaXml = qtiMetaGenerator.generateAssessmentMeta(quiz, assessmentId);
            long step2Duration = System.currentTimeMillis() - step2Start;
            log.info("Step 2/5: Assessment metadata generated ({} bytes) in {}ms", assessmentMetaXml.length(),
                    step2Duration);

            // Step 3: Generate IMS manifest
            log.info("Step 3/5: Generating IMS manifest");
            long step3Start = System.currentTimeMillis();
            String manifestXml = manifestGenerator.generateManifest(quiz.getTitle(), assessmentId);
            long step3Duration = System.currentTimeMillis() - step3Start;
            log.info("Step 3/5: Manifest generated ({} bytes) in {}ms", manifestXml.length(), step3Duration);

            result.setManifestGenerated(true);
            result.setManifestSize(manifestXml.length());

            // Step 4: Create ZIP package
            log.info("Step 4/5: Creating QTI package ZIP");
            long step4Start = System.currentTimeMillis();
            byte[] qtiZipBytes = zipArchiveService.createCanvasQtiPackage(
                    manifestXml, qtiContentXml, assessmentMetaXml, assessmentId);
            long step4Duration = System.currentTimeMillis() - step4Start;
            log.info("Step 4/5: ZIP package created ({} bytes) in {}ms", qtiZipBytes.length, step4Duration);

            result.setZipCreated(true);
            result.setZipSize(qtiZipBytes.length);
            result.setQtiPackage(qtiZipBytes);

            // Step 5: Upload to Canvas
            log.info("Step 5/5: Uploading to Canvas and initiating migration");
            long step5Start = System.currentTimeMillis();
            String migrationStatus = canvasMigrationService.uploadAndMigrate(courseId, qtiZipBytes, quiz.getTitle());
            long step5Duration = System.currentTimeMillis() - step5Start;
            log.info("Step 5/5: Upload completed in {}ms", step5Duration);

            result.setCanvasUploadCompleted(true);
            result.setMigrationStatus(migrationStatus);

            // Final result
            long totalDuration = System.currentTimeMillis() - startTime;
            result.setSuccess(true);
            result.setTotalDurationMs(totalDuration);
            result.setMessage("QTI package successfully uploaded to Canvas. Check Canvas for import status.");

            log.info("=== QTI import workflow completed successfully in {}ms ===", totalDuration);
            log.info("Performance: QTI={}ms, Meta={}ms, Manifest={}ms, ZIP={}ms, Upload={}ms",
                    step1Duration, step2Duration, step3Duration, step4Duration, step5Duration);

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

        // Generate QTI content (returns both content and assessment ID)
        QtiContentGeneratorService.QtiGenerationResult qtiResult = qtiContentGenerator.generateQtiContent(quiz);
        String assessmentId = qtiResult.assessmentIdent();
        String qtiContentXml = qtiResult.content();

        // Generate Canvas assessment metadata
        String assessmentMetaXml = qtiMetaGenerator.generateAssessmentMeta(quiz, assessmentId);

        // Generate manifest (now includes reference to meta file)
        String manifestXml = manifestGenerator.generateManifest(quiz.getTitle(), assessmentId);

        // Create ZIP with Canvas-compatible structure
        byte[] qtiZipBytes = zipArchiveService.createCanvasQtiPackage(
                manifestXml, qtiContentXml, assessmentMetaXml, assessmentId);

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
