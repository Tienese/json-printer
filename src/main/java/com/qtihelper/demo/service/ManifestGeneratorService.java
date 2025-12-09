package com.qtihelper.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for generating IMS Manifest XML for QTI 1.2 packages.
 * The manifest describes the package structure and resources.
 */
@Service
public class ManifestGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(ManifestGeneratorService.class);

    /**
     * Generate imsmanifest.xml content for a QTI package.
     *
     * @param quizTitle Title of the quiz/question bank
     * @return XML string for imsmanifest.xml
     */
    public String generateManifest(String quizTitle) {
        log.info("Generating IMS manifest for quiz: {}", quizTitle);

        String identifier = "qti_" + UUID.randomUUID().toString().replace("-", "");
        String resourceId = "resource_" + UUID.randomUUID().toString().replace("-", "");

        StringBuilder xml = new StringBuilder();

        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<manifest identifier=\"").append(identifier).append("\"\n");
        xml.append("  xmlns=\"http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1\"\n");
        xml.append("  xmlns:imsmd=\"http://www.imsglobal.org/xsd/imsmd_v1p2\"\n");
        xml.append("  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n");
        xml.append("  xsi:schemaLocation=\"http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 ");
        xml.append("http://www.imsglobal.org/xsd/imscp_v1p1.xsd ");
        xml.append("http://www.imsglobal.org/xsd/imsmd_v1p2 ");
        xml.append("http://www.imsglobal.org/xsd/imsmd_v1p2p2.xsd\">\n");

        // Metadata
        xml.append("  <metadata>\n");
        xml.append("    <schema>IMS Content</schema>\n");
        xml.append("    <schemaversion>1.1.3</schemaversion>\n");
        xml.append("    <imsmd:lom>\n");
        xml.append("      <imsmd:general>\n");
        xml.append("        <imsmd:title>\n");
        xml.append("          <imsmd:langstring xml:lang=\"en\">").append(escapeXml(quizTitle)).append("</imsmd:langstring>\n");
        xml.append("        </imsmd:title>\n");
        xml.append("      </imsmd:general>\n");
        xml.append("    </imsmd:lom>\n");
        xml.append("  </metadata>\n");

        // Organizations (empty for question banks)
        xml.append("  <organizations/>\n");

        // Resources
        xml.append("  <resources>\n");
        xml.append("    <resource identifier=\"").append(resourceId).append("\" type=\"imsqti_xmlv1p2\">\n");
        xml.append("      <file href=\"quiz_content.xml\"/>\n");
        xml.append("    </resource>\n");
        xml.append("  </resources>\n");

        xml.append("</manifest>\n");

        log.debug("Generated manifest XML ({} bytes)", xml.length());
        return xml.toString();
    }

    /**
     * Escape special XML characters.
     */
    private String escapeXml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }
}
