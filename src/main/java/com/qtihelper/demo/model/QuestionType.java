package com.qtihelper.demo.model;

import java.util.Arrays;

public enum QuestionType {
    MULTIPLE_CHOICE("MC"),
    MULTIPLE_ANSWERS("MA"),
    MULTIPLE_DROPDOWN("MD"),
    MATCHING("MT"),
    TRUE_FALSE("TF"),
    // Add DD mapping for Multiple Dropdown as per JSON template
    DD("DD"); 

    public final String code;

    QuestionType(String code) {
        this.code = code;
    }

    public static QuestionType fromCode(String code) {
        if (code == null)
            throw new IllegalArgumentException("QuestionType code cannot be null");

        // Handle DD alias to MD if necessary, or strictly map code
        String lookupCode = code.trim();
        if ("DD".equalsIgnoreCase(lookupCode)) return MULTIPLE_DROPDOWN;

        return Arrays.stream(values())
                .filter(c -> c.code.equalsIgnoreCase(lookupCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown QuestionType code: " + code));
    }
}