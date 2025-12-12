package com.qtihelper.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.qtihelper.demo.dto.worksheet.GridRow;
import com.qtihelper.demo.dto.worksheet.HeaderRow;
import com.qtihelper.demo.dto.worksheet.TextRow;
import com.qtihelper.demo.dto.worksheet.WorksheetConfigDto;
import com.qtihelper.demo.dto.worksheet.WorksheetRow;
import com.qtihelper.demo.model.GridRowViewModel;
import com.qtihelper.demo.model.HeaderRowViewModel;
import com.qtihelper.demo.model.RowViewModel;
import com.qtihelper.demo.model.TextRowViewModel;
import com.qtihelper.demo.model.WorksheetViewModel;

/**
 * Service for generating worksheet view models from configuration DTOs.
 * Validates configuration and transforms polymorphic row types to view models.
 */
@Service
public class WorksheetGeneratorService {

	private static final Logger log = LoggerFactory
			.getLogger(WorksheetGeneratorService.class);

	private static final int MAX_ROWS = 50;

	/**
	 * Generates worksheet view model from configuration DTO.
	 * @param config Worksheet configuration with rows
	 * @return Immutable view model for template rendering
	 * @throws IllegalArgumentException if configuration is invalid
	 */
	public WorksheetViewModel generateWorksheet(WorksheetConfigDto config) {
		log.info("Starting worksheet generation with {} rows",
				config.getRows() != null ? config.getRows().size() : 0);

		// Validation Step 1: Null and empty checks
		if (config.getRows() == null || config.getRows().isEmpty()) {
			log.error("Worksheet has no rows");
			throw new IllegalArgumentException("Worksheet must have at least one row");
		}

		// Validation Step 2: Row count limit
		if (config.getRows().size() > MAX_ROWS) {
			log.error("Row count {} exceeds maximum {}", config.getRows().size(),
					MAX_ROWS);
			throw new IllegalArgumentException(
					String.format("Worksheet cannot have more than %d rows", MAX_ROWS));
		}

		// Validation Step 3: Validate each row
		log.info("Validating {} rows...", config.getRows().size());
		for (int i = 0; i < config.getRows().size(); i++) {
			WorksheetRow row = config.getRows().get(i);
			try {
				row.validate();
			}
			catch (IllegalArgumentException e) {
				log.error("Row {} validation failed: {}", i + 1, e.getMessage());
				throw new IllegalArgumentException(
						String.format("Row %d: %s", i + 1, e.getMessage()));
			}
		}

		log.info("All rows validated. Converting to view models...");

		// Convert rows to view models
		List<RowViewModel> rowViewModels = new ArrayList<>();
		int totalGridRows = 0;
		int totalBoxes = 0;

		for (WorksheetRow row : config.getRows()) {
			RowViewModel viewModel = convertToViewModel(row, config.isShowGuideLines());
			rowViewModels.add(viewModel);

			if (viewModel instanceof GridRowViewModel gridVm) {
				totalGridRows++;
				totalBoxes += gridVm.boxCount();
			}
		}

		// Create final view model
		WorksheetViewModel result = new WorksheetViewModel(
				config.getTitle() != null ? config.getTitle() : "Practice Sheet",
				config.isShowGuideLines(), rowViewModels, totalGridRows, totalBoxes);

		log.info("Successfully generated worksheet: {} rows, {} grid rows, {} boxes",
				rowViewModels.size(), totalGridRows, totalBoxes);

		return result;
	}

	/**
	 * Converts a WorksheetRow DTO to its corresponding RowViewModel.
	 * Applies global settings where appropriate.
	 */
	private RowViewModel convertToViewModel(WorksheetRow row,
			boolean globalShowGuideLines) {
		return switch (row) {
			case HeaderRow header -> new HeaderRowViewModel(header.isShowDate(),
					header.isShowName(), header.getNameLabel(), header.getDateLabel());

			case TextRow text -> new TextRowViewModel(text.getText(), text.getFontSize(),
					text.isBold(), text.getAlignment());

			case GridRow grid -> {
				// Process content string into character list
				List<String> characters = processGridContent(grid.getContent(),
						grid.getBoxCount());

				// Apply global guide lines setting if row doesn't override
				boolean showGuides = grid.isShowGuideLines() && globalShowGuideLines;

				yield new GridRowViewModel(grid.getBoxSize().getSizeInMm(),
						grid.getBoxCount(), characters, showGuides,
						"box-" + grid.getBoxSize().getSizeInMm() + "mm");
			}

			default -> throw new IllegalArgumentException(
					"Unknown row type: " + row.getClass().getName());
		};
	}

	/**
	 * Processes grid content string into a list of characters.
	 * - Splits string into individual characters (Unicode-aware)
	 * - Truncates if longer than boxCount
	 * - Pads with empty strings if shorter than boxCount
	 * @param content The content string (e.g., "あいうえお")
	 * @param boxCount The number of boxes in the row
	 * @return List of exactly boxCount strings
	 */
	private List<String> processGridContent(String content, int boxCount) {
		if (content == null || content.isEmpty()) {
			// Return list of empty strings
			return java.util.stream.IntStream.range(0, boxCount).mapToObj(i -> "")
					.collect(Collectors.toList());
		}

		// Split into code points (handles surrogate pairs for emoji/rare kanji)
		List<String> characters = content.codePoints().mapToObj(Character::toString)
				.collect(Collectors.toList());

		// Truncate if too long
		if (characters.size() > boxCount) {
			log.debug("Truncating content from {} to {} characters", characters.size(),
					boxCount);
			characters = new ArrayList<>(characters.subList(0, boxCount));
		}

		// Pad if too short
		while (characters.size() < boxCount) {
			characters.add("");
		}

		return characters;
	}

}
