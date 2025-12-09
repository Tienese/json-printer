package com.qtihelper.demo.dto.quiz;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing the result of validating a quiz JSON.
 * Contains validation errors (which fail validation) and warnings (which don't).
 */
public class QuizValidationResult {

    private boolean valid;
    private List<String> errors;
    private List<String> warnings;

    // Private constructor for factory methods
    private QuizValidationResult() {
        this.errors = new ArrayList<>();
        this.warnings = new ArrayList<>();
    }

    /**
     * Create a successful validation result.
     */
    public static QuizValidationResult success() {
        QuizValidationResult result = new QuizValidationResult();
        result.valid = true;
        return result;
    }

    /**
     * Create a failed validation result with errors.
     */
    public static QuizValidationResult failure(List<String> errors) {
        QuizValidationResult result = new QuizValidationResult();
        result.valid = false;
        result.errors = new ArrayList<>(errors);
        return result;
    }

    /**
     * Add an error to the validation result.
     * Errors cause validation to fail.
     */
    public void addError(String error) {
        if (error != null && !error.isBlank()) {
            this.errors.add(error);
        }
    }

    /**
     * Add a warning to the validation result.
     * Warnings don't cause validation to fail.
     */
    public void addWarning(String warning) {
        if (warning != null && !warning.isBlank()) {
            this.warnings.add(warning);
        }
    }

    /**
     * Check if validation passed.
     * Returns true only if there are no errors.
     */
    public boolean isValid() {
        return errors.isEmpty();
    }

    // Getters
    public List<String> getErrors() {
        return errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("QuizValidationResult{");
        sb.append("valid=").append(isValid());

        if (!errors.isEmpty()) {
            sb.append(", errors=[");
            sb.append(String.join("; ", errors));
            sb.append("]");
        }

        if (!warnings.isEmpty()) {
            sb.append(", warnings=[");
            sb.append(String.join("; ", warnings));
            sb.append("]");
        }

        sb.append("}");
        return sb.toString();
    }
}
