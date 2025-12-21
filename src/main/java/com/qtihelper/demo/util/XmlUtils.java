package com.qtihelper.demo.util;

/**
 * Utility class for XML-related operations.
 */
public final class XmlUtils {

    private XmlUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Escapes special XML characters in text.
     * Converts &, <, >, ", and ' to their XML entity equivalents.
     *
     * @param text Text to escape
     * @return XML-safe text with special characters escaped
     */
    public static String escape(String text) {
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
