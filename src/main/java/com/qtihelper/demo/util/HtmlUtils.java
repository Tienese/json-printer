package com.qtihelper.demo.util;

/**
 * Utility class for HTML-related operations.
 */
public final class HtmlUtils {

    private static final String EQUATION_PLACEHOLDER = "[Equation]";

    private HtmlUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Strips HTML tags from text while preserving meaningful content.
     * Detects images and equations and provides placeholders.
     *
     * @param text HTML text
     * @return Plain text without HTML tags, with placeholders for images/equations
     */
    public static String stripHtml(String text) {
        if (text == null) {
            return "";
        }

        String result = text;

        // Detect and replace images with placeholder
        if (result.contains("<img")) {
            // Extract alt text if available, otherwise use generic placeholder
            result = result.replaceAll("<img[^>]*alt=[\"']([^\"']*)[\"'][^>]*>", "[Image: $1]");
            result = result.replaceAll("<img[^>]*>", "[Image]");
        }

        // Detect and replace MathML/LaTeX equations with placeholder
        if (result.contains("<math") || result.contains("\\(") || result.contains("\\[")) {
            result = result.replaceAll("<math[^>]*>.*?</math>", EQUATION_PLACEHOLDER);
            result = result.replaceAll("\\\\\\([^\\)]*\\\\\\)", EQUATION_PLACEHOLDER);
            result = result.replaceAll("\\\\\\[[^\\]]*\\\\\\]", EQUATION_PLACEHOLDER);
        }

        // Detect Canvas equation images (common pattern)
        if (result.contains("equation_images")) {
            result = result.replaceAll("<img[^>]*equation_images[^>]*>", EQUATION_PLACEHOLDER);
        }

        // Strip remaining HTML tags
        // Use a non-greedy match for tags to avoid eating too much content
        result = result.replaceAll("<[^>]+>", " ").trim();

        // Clean up excessive whitespace created by tag removal
        result = result.replaceAll("\\s+", " ");

        // Decode common HTML entities
        result = result.replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replace("&rsquo;", "'")
                .replace("&lsquo;", "'")
                .replace("&rdquo;", "\"")
                .replace("&ldquo;", "\"");

        // If result is empty or only whitespace after stripping, return a placeholder
        if (result.isEmpty()) {
            return "[No text content]";
        }

        return result.trim();
    }
}
