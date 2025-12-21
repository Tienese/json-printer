package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.canvas.CanvasQuestionDto;
import com.qtihelper.demo.model.StudentSubmission;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for parsing student submission CSV files.
 * 
 * Expected CSV format:
 * student_id,first_name,last_name,q1,q2,q3,...,total_score
 */
@Service
public class StudentSubmissionParser {

    private static final Logger log = LoggerFactory.getLogger(StudentSubmissionParser.class);

    /**
     * Parse CSV file into StudentSubmission objects.
     * 
     * @param csvInputStream CSV file input stream
     * @param questions      List of quiz questions for validation
     * @return List of parsed submissions
     */
    public List<StudentSubmission> parseSubmissions(
            InputStream csvInputStream,
            List<CanvasQuestionDto> questions) throws IOException {

        List<StudentSubmission> submissions = new ArrayList<>();

        try (Reader reader = new InputStreamReader(csvInputStream);
                CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                        .withFirstRecordAsHeader()
                        .withIgnoreHeaderCase()
                        .withTrim())) {

            for (CSVRecord record : csvParser) {
                try {
                    StudentSubmission submission = parseRecord(record, questions.size());
                    submissions.add(submission);
                } catch (Exception e) {
                    log.warn("Failed to parse CSV record {}: {}", record.getRecordNumber(), e.getMessage());
                }
            }
        }

        log.info("Parsed {} student submissions from CSV", submissions.size());
        return submissions;
    }

    /**
     * Parse a single CSV record into a StudentSubmission.
     */
    private StudentSubmission parseRecord(CSVRecord record, int questionCount) {
        StudentSubmission submission = new StudentSubmission();

        // Parse student info
        submission.setStudentId(record.get("student_id"));
        submission.setFirstName(getOptionalField(record, "first_name"));
        submission.setLastName(getOptionalField(record, "last_name"));

        // Parse question responses
        Map<Integer, String> responses = new HashMap<>();
        for (int i = 1; i <= questionCount; i++) {
            String questionKey = "q" + i;
            if (record.isMapped(questionKey)) {
                String answer = record.get(questionKey);
                if (answer != null && !answer.trim().isEmpty()) {
                    responses.put(i, answer.trim());
                }
            }
        }
        submission.setResponses(responses);

        // Parse total score
        if (record.isMapped("total_score")) {
            try {
                String scoreStr = record.get("total_score");
                if (scoreStr != null && !scoreStr.trim().isEmpty()) {
                    submission.setTotalScore(Double.parseDouble(scoreStr));
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid total_score for student {}: {}",
                        submission.getStudentId(), record.get("total_score"));
            }
        }

        return submission;
    }

    /**
     * Get optional field from CSV record.
     */
    private String getOptionalField(CSVRecord record, String fieldName) {
        if (record.isMapped(fieldName)) {
            String value = record.get(fieldName);
            return value != null ? value.trim() : "";
        }
        return "";
    }
}
