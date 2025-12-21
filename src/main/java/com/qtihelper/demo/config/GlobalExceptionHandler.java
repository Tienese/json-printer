package com.qtihelper.demo.config;

import com.qtihelper.demo.exception.CanvasApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String TYPE = "type";

    @ExceptionHandler(CanvasApiException.class)
    public ResponseEntity<Map<String, Object>> handleCanvasApiException(CanvasApiException e) {
        log.warn("Canvas API error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        SUCCESS, false,
                        ERROR, "Canvas API Error: " + e.getMessage(),
                        TYPE, "CanvasApiException"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("Invalid argument: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        SUCCESS, false,
                        ERROR, e.getMessage(),
                        TYPE, "IllegalArgumentException"));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNoSuchElementException(NoSuchElementException e) {
        log.warn("Resource not found: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        SUCCESS, false,
                        ERROR, "Resource not found: " + e.getMessage(),
                        TYPE, "NoSuchElementException"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("Unhandled exception occurred: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        SUCCESS, false,
                        ERROR, e.getMessage() != null ? e.getMessage() : "Internal Server Error",
                        TYPE, e.getClass().getName()));
    }
}
