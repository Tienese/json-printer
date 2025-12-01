package com.qtihelper.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.qtihelper.demo.config.CanvasProperties;
import com.qtihelper.demo.model.Quiz;
import com.qtihelper.demo.parser.QuizParser;
import com.qtihelper.demo.service.CanvasUploader;
import com.qtihelper.demo.writer.QtiWriter;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DemoApplication implements CommandLineRunner {
	private static final Logger log = LoggerFactory.getLogger(DemoApplication.class);

	private final QuizParser parser;
	private final QtiWriter writer;
	private final CanvasUploader uploader;

	public DemoApplication(QuizParser parser, QtiWriter writer, CanvasUploader uploader) {
		this.parser = parser;
		this.writer = writer;
		this.uploader = uploader;
	}

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Override
	public void run(String... args) {
		log.info(">>> QTI Helper Started");

		if (args.length < 1) {
			printHelp();
			return;
		}

		String inputFilename = args[0];
		String courseId = args.length > 1 ? args[1] : null;
		Path inputPath = Paths.get(inputFilename);

		if (!validateInputFile(inputPath)) {
			return;
		}

		// JSON file extension check
		if (!inputFilename.toLowerCase().endsWith(".json")) {
			log.error("[!] Invalid input format. Please provide a .json file.");
			return;
		}

		Path outputPath = Paths.get(inputFilename.replace(".json", ".zip"));

		try {
			log.info("1. Parsing JSON input file: {}", inputPath);
			Quiz quiz = parser.parse(inputPath);

			if (quiz.getQuestions().isEmpty()) {
				log.error("[!] The parsed quiz contains 0 questions. Aborting.");
				return;
			}

			log.info("   Parsed successfully. Title: \"{}\" | Questions: {}",
					quiz.getTitle(), quiz.getQuestions().size());

			log.info("2. Generating QTI Zip package...");
			writer.createQtiPackage(quiz, outputPath);
			log.info("   Zip successfully created at: {}", outputPath.toAbsolutePath());

			if (courseId != null) {
				log.info("3. Initiating Canvas Upload...");
				boolean success = uploader.uploadAndMigrate(courseId, quiz.getTitle(), outputPath);
				if (success) {
					log.info("DEPLOYMENT SUCCESSFUL");
				} else {
					log.warn("DEPLOYMENT FAILED");
				}
			}

		} catch (Exception e) {
			log.error("[!] Critical error: {}", e.getMessage(), e);
		}
	}

	private boolean validateInputFile(Path path) {
		if (!Files.exists(path)) {
			log.error("[!] Input file does not exist: {}", path);
			return false;
		}
		return true;
	}

	private void printHelp() {
		log.info("Usage: java -jar qti-helper.jar <input.json> [course_id]");
	}
}
