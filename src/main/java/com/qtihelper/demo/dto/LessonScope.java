package com.qtihelper.demo.dto;

/**
 * DTO for lesson scope in grammar analysis requests.
 */
public record LessonScope(
        String mode, // "single" or "range"
        Integer target, // Target lesson number
        Integer rangeStart, // Start of range (if mode = "range")
        Integer rangeEnd // End of range (if mode = "range")
) {
    /**
     * Create a single lesson scope.
     */
    public static LessonScope single(int lesson) {
        return new LessonScope("single", lesson, null, null);
    }

    /**
     * Create a range lesson scope.
     */
    public static LessonScope range(int target, int start, int end) {
        return new LessonScope("range", target, start, end);
    }

    /**
     * Get all lesson IDs in this scope.
     */
    public java.util.List<Integer> getLessonIds() {
        if ("single".equals(mode)) {
            if (target == null) {
                return java.util.List.of();
            }
            return java.util.List.of(target);
        } else {
            if (rangeStart == null || rangeEnd == null) {
                return java.util.List.of();
            }
            var ids = new java.util.ArrayList<Integer>();
            for (int i = rangeStart; i <= rangeEnd; i++) {
                ids.add(i);
            }
            return ids;
        }
    }
}
