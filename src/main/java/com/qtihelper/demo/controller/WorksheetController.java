package com.qtihelper.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.qtihelper.demo.dto.worksheet.BoxSize;
import com.qtihelper.demo.dto.worksheet.WorksheetConfigDto;
import com.qtihelper.demo.model.WorksheetViewModel;
import com.qtihelper.demo.service.WorksheetGeneratorService;

/**
 * Controller for Japanese writing worksheet generation.
 *
 * Endpoints:
 * - GET /worksheet : Show worksheet builder UI
 * - POST /worksheet/generate : Generate printable worksheet from JSON
 * - POST /worksheet/validate : Validate worksheet JSON configuration
 *
 * Uses JSON request bodies for flexible row-based worksheet composition.
 */
@Controller
public class WorksheetController {

	private static final Logger log = LoggerFactory
			.getLogger(WorksheetController.class);

	private final WorksheetGeneratorService worksheetService;

	public WorksheetController(WorksheetGeneratorService worksheetService) {
		this.worksheetService = worksheetService;
	}

	/**
	 * Display worksheet builder UI.
	 * Provides BoxSize enum options for grid row configuration.
	 */
	@GetMapping("/worksheet")
	public String showWorksheetBuilder(Model model) {
		log.info("Worksheet builder UI accessed");

		// Add BoxSize enum for dropdown options
		model.addAttribute("boxSizes", BoxSize.values());

		log.debug("Rendering worksheet-builder.html");
		return "worksheet-builder";
	}

	/**
	 * Generate worksheet from JSON configuration.
	 * Accepts polymorphic row types (HEADER, TEXT, GRID).
	 * @param config Worksheet configuration with rows array
	 * @param model Model for rendering
	 * @return View name for print template or error template
	 */
	@PostMapping(value = "/worksheet/generate", consumes = MediaType.APPLICATION_JSON_VALUE)
	public String generateWorksheet(@RequestBody WorksheetConfigDto config,
			Model model) {

		long startTime = System.currentTimeMillis();
		log.info("=== Starting worksheet generation ===");
		log.info("Title: '{}', Show Guide Lines: {}, Row Count: {}",
				config.getTitle(), config.isShowGuideLines(),
				config.getRows() != null ? config.getRows().size() : 0);

		try {
			// Step 1: Generate view model (includes validation)
			log.info("Step 1/2: Validating and generating view model...");
			long step1Start = System.currentTimeMillis();

			WorksheetViewModel viewModel = worksheetService
					.generateWorksheet(config);
			long step1Duration = System.currentTimeMillis() - step1Start;

			log.info("Step 1/2: Successfully generated view model in {}ms",
					step1Duration);

			// Step 2: Add to model and render
			log.info("Step 2/2: Preparing template rendering...");
			model.addAttribute("worksheet", viewModel);

			long totalDuration = System.currentTimeMillis() - startTime;
			log.info(
					"=== Worksheet generation completed successfully in {}ms ===",
					totalDuration);
			log.info("Performance breakdown: ViewModelGeneration={}ms",
					step1Duration);

			return "worksheet-print";

		}
		catch (IllegalArgumentException e) {
			log.error("=== Invalid worksheet configuration ===");
			log.error("Error message: {}", e.getMessage());

			model.addAttribute("error", e.getMessage());
			return "worksheet-error";

		}
		catch (Exception e) {
			log.error("=== Unexpected error generating worksheet ===", e);
			log.error("Error type: {}", e.getClass().getName());
			log.error("Error message: {}", e.getMessage());

			model.addAttribute("error",
					"An unexpected error occurred. Please check the logs.");
			return "worksheet-error";
		}
	}

	/**
	 * Validate worksheet configuration without generating.
	 * Returns JSON with validation result.
	 * @param config Worksheet configuration to validate
	 * @return JSON response with valid flag and optional error message
	 */
	@PostMapping(value = "/worksheet/validate", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public ResponseEntity<Map<String, Object>> validateWorksheet(
			@RequestBody WorksheetConfigDto config) {

		log.info("Validating worksheet configuration...");

		Map<String, Object> response = new HashMap<>();

		try {
			// Attempt to generate - this validates the configuration
			worksheetService.generateWorksheet(config);

			response.put("valid", true);
			response.put("message", "Configuration is valid");
			log.info("Validation passed");
			return ResponseEntity.ok(response);

		}
		catch (IllegalArgumentException e) {
			response.put("valid", false);
			response.put("message", e.getMessage());
			log.warn("Validation failed: {}", e.getMessage());
			return ResponseEntity.badRequest().body(response);

		}
		catch (Exception e) {
			response.put("valid", false);
			response.put("message",
					"Unexpected error during validation: " + e.getMessage());
			log.error("Validation error", e);
			return ResponseEntity.internalServerError().body(response);
		}
	}

}
