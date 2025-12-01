package com.qtihelper.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Type-safe configuration for Canvas API.
 * Uses Java 21 Record for immutability.
 */
@ConfigurationProperties(prefix = "app.canvas")
public record CanvasProperties(String url, String token) {
    // Spring Boot 3.x+ binds records automatically via constructor binding
}