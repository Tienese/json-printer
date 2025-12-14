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


}
