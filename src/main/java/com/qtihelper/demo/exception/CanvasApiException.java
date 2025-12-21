package com.qtihelper.demo.exception;

/**
 * Custom exception for Canvas API related errors.
 * Used for migration, upload, and data fetching operations.
 */
public class CanvasApiException extends RuntimeException {

    public CanvasApiException(String message) {
        super(message);
    }

    public CanvasApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
