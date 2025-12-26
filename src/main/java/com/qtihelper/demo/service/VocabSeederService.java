package com.qtihelper.demo.service;

import com.qtihelper.demo.entity.Vocab;
import com.qtihelper.demo.repository.VocabRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Startup service that loads vocabulary from CSV files into the database.
 * Runs on application startup and reloads vocab from csv/lesson_*.csv files.
 */
@Service
public class VocabSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(VocabSeederService.class);

    private static final String CSV_DIRECTORY = "csv";
    private static final Pattern LESSON_PATTERN = Pattern.compile("lesson_(\\d+)\\.csv");

    private final VocabRepository vocabRepository;
    private final SudachiTokenizerService tokenizerService;

    public VocabSeederService(VocabRepository vocabRepository, SudachiTokenizerService tokenizerService) {
        this.vocabRepository = vocabRepository;
        this.tokenizerService = tokenizerService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting vocabulary CSV seeder...");

        Path csvDir = Paths.get(CSV_DIRECTORY);
        if (!Files.exists(csvDir) || !Files.isDirectory(csvDir)) {
            log.warn("CSV directory '{}' not found. Skipping vocab seeding.", CSV_DIRECTORY);
            return;
        }

        try (Stream<Path> files = Files.list(csvDir)) {
            files.filter(Files::isRegularFile)
                    .filter(p -> LESSON_PATTERN.matcher(p.getFileName().toString()).matches())
                    .forEach(this::processLessonFile);
        } catch (IOException e) {
            log.error("Failed to scan CSV directory: {}", e.getMessage(), e);
        }

        log.info("Vocabulary seeding complete. Total vocab count: {}", vocabRepository.count());
    }

    /**
     * Process a single lesson CSV file.
     * Deletes existing vocab for this lesson and reloads from CSV.
     */
    @Transactional
    public void processLessonFile(Path csvFile) {
        String filename = csvFile.getFileName().toString();
        Matcher matcher = LESSON_PATTERN.matcher(filename);

        if (!matcher.matches()) {
            log.warn("Skipping non-matching file: {}", filename);
            return;
        }

        int lessonId = Integer.parseInt(matcher.group(1));
        log.info("Processing lesson {} from file: {}", lessonId, filename);

        try {
            // Step 1: Delete existing vocab for this lesson (WIPE policy)
            long deletedCount = vocabRepository.countByLessonId(lessonId);
            vocabRepository.deleteByLessonId(lessonId);
            if (deletedCount > 0) {
                log.info("Deleted {} existing vocab entries for lesson {}", deletedCount, lessonId);
            }

            // Step 2: Read CSV file (single column, UTF-8)
            List<String> lines = Files.readAllLines(csvFile, StandardCharsets.UTF_8);
            log.debug("Read {} lines from {}", lines.size(), filename);

            // Step 3: Process each word
            List<Vocab> vocabList = new ArrayList<>();
            int skippedCount = 0;

            for (String line : lines) {
                String displayForm = line.trim();

                // Skip empty lines and comments
                if (displayForm.isEmpty() || displayForm.startsWith("#")) {
                    skippedCount++;
                    continue;
                }

                // Normalize to base form and extract POS using Kuromoji
                var result = tokenizerService.normalizeWordWithPos(displayForm);

                var baseForm = (result != null) ? result.baseForm() : displayForm;
                var pos = (result != null) ? result.pos() : null;

                var vocab = new Vocab(lessonId, displayForm, baseForm, pos);
                vocabList.add(vocab);
            }

            // Step 4: Bulk save
            vocabRepository.saveAll(vocabList);

            log.info("Loaded {} words for Lesson {} (skipped {} empty/comment lines)",
                    vocabList.size(), lessonId, skippedCount);

        } catch (IOException e) {
            log.error("Failed to process {}: {}", filename, e.getMessage(), e);
        }
    }
}
