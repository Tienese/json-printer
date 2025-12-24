package com.qtihelper.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import java.io.File;

/**
 * Main Spring Boot application entry point for QTI Helper.
 * Converts quizzes to Canvas format and generates print reports.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class DemoApplication {

	public static void main(String[] args) {
		// Ensure data directory exists for SQLite
		new File("data").mkdirs();
		SpringApplication.run(DemoApplication.class, args);
	}

}
