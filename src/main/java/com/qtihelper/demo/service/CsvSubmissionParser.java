package com.qtihelper.demo.service;

import com.qtihelper.demo.model.StudentSubmission;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CsvSubmissionParser {
    
    private static final Logger log = LoggerFactory.getLogger(CsvSubmissionParser.class);
    private static final Pattern QUESTION_PATTERN = Pattern.compile("#(\\d+) Student Response");
    
    public List<StudentSubmission> parseSubmissions(MultipartFile csvFile) throws IOException {
        log.info("Starting CSV parsing for file: {} (size: {} bytes)",
                csvFile.getOriginalFilename(), csvFile.getSize());

        List<StudentSubmission> submissions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(csvFile.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = new CSVParser(reader,
                     CSVFormat.DEFAULT.builder()
                             .setHeader()
                             .setSkipHeaderRecord(true)
                             .setIgnoreEmptyLines(true)
                             .build())) {

            List<String> headers = parser.getHeaderNames();
            log.info("CSV contains {} columns", headers.size());
            log.debug("CSV Headers: {}", headers);

            // Count question columns
            long questionColumns = headers.stream()
                    .filter(h -> QUESTION_PATTERN.matcher(h).matches())
                    .count();
            log.info("Found {} question response columns in CSV", questionColumns);

            int recordCount = 0;
            for (CSVRecord submissionRecord : parser) {
                recordCount++;
                log.debug("Processing record #{} (line {})", recordCount, submissionRecord.getRecordNumber());

                StudentSubmission submission = new StudentSubmission();

                // Parse student info
                submission.setQuizName(getValueOrEmpty(submissionRecord, "Quiz Name"));
                submission.setFirstName(getValueOrEmpty(submissionRecord, "Student First Name"));
                submission.setLastName(getValueOrEmpty(submissionRecord, "Student Last Name"));
                submission.setStudentId(getValueOrEmpty(submissionRecord, "Student ID"));
                submission.setExportTimestamp(getValueOrEmpty(submissionRecord, "Export Timestamp"));

                log.debug("Student info - Name: {} {}, ID: {}",
                        submission.getFirstName(), submission.getLastName(), submission.getStudentId());

                // Parse question responses
                int responseCount = 0;
                for (String header : headers) {
                    Matcher matcher = QUESTION_PATTERN.matcher(header);
                    if (matcher.matches()) {
                        int questionNumber = Integer.parseInt(matcher.group(1));
                        String response = getValueOrEmpty(submissionRecord, header);
                        if (!response.isEmpty()) {
                            submission.getResponses().put(questionNumber, response);
                            responseCount++;
                            log.debug("Q{}: {}", questionNumber,
                                    response.length() > 50 ? response.substring(0, 50) + "..." : response);
                        }
                    }
                }

                submissions.add(submission);
                log.info("Parsed student: {} {} (ID: {}) with {} responses",
                        submission.getFirstName(), submission.getLastName(),
                        submission.getStudentId(), submission.getResponses().size());
            }

            log.info("Successfully parsed {} student submissions from CSV", submissions.size());

        } catch (IOException e) {
            log.error("Failed to parse CSV file: {}", e.getMessage(), e);
            throw e;
        }

        return submissions;
    }
    
    private String getValueOrEmpty(CSVRecord record, String column) {
        try {
            String value = record.get(column);
            return value != null ? value.trim() : "";
        } catch (IllegalArgumentException e) {
            log.debug("Column '{}' not found in CSV record", column);
            return "";
        }
    }
}
