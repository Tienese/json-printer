package com.qtihelper.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Service for creating ZIP archives containing QTI content.
 */
@Service
public class ZipArchiveService {

    private static final Logger log = LoggerFactory.getLogger(ZipArchiveService.class);

    /**
     * Create a ZIP archive containing manifest and QTI content files.
     *
     * @param manifestXml  Content of imsmanifest.xml
     * @param qtiContentXml Content of quiz_content.xml
     * @return Byte array of the ZIP file
     * @throws IOException if ZIP creation fails
     */
    public byte[] createQtiPackage(String manifestXml, String qtiContentXml) throws IOException {
        log.info("Creating QTI package ZIP file");

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            // Add imsmanifest.xml
            log.debug("Adding imsmanifest.xml to ZIP");
            ZipEntry manifestEntry = new ZipEntry("imsmanifest.xml");
            zos.putNextEntry(manifestEntry);
            zos.write(manifestXml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // Add quiz_content.xml
            log.debug("Adding quiz_content.xml to ZIP");
            ZipEntry contentEntry = new ZipEntry("quiz_content.xml");
            zos.putNextEntry(contentEntry);
            zos.write(qtiContentXml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.finish();

            byte[] zipBytes = baos.toByteArray();
            log.info("Created QTI package ZIP ({} bytes)", zipBytes.length);

            return zipBytes;

        } catch (IOException e) {
            log.error("Failed to create QTI package ZIP", e);
            throw new IOException("Failed to create ZIP archive: " + e.getMessage(), e);
        }
    }

    /**
     * Create a ZIP archive with custom file entries.
     *
     * @param files Map of filename to file content
     * @return Byte array of the ZIP file
     * @throws IOException if ZIP creation fails
     */
    public byte[] createZipArchive(java.util.Map<String, String> files) throws IOException {
        log.info("Creating ZIP archive with {} files", files.size());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (java.util.Map.Entry<String, String> entry : files.entrySet()) {
                String filename = entry.getKey();
                String content = entry.getValue();

                log.debug("Adding {} to ZIP ({} bytes)", filename, content.length());

                ZipEntry zipEntry = new ZipEntry(filename);
                zos.putNextEntry(zipEntry);
                zos.write(content.getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }

            zos.finish();

            byte[] zipBytes = baos.toByteArray();
            log.info("Created ZIP archive ({} bytes)", zipBytes.length);

            return zipBytes;

        } catch (IOException e) {
            log.error("Failed to create ZIP archive", e);
            throw new IOException("Failed to create ZIP archive: " + e.getMessage(), e);
        }
    }
}
