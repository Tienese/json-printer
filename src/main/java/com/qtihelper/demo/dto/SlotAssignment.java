package com.qtihelper.demo.dto;

/**
 * Represents a slot assignment for a word in a sentence.
 * Links a word to its grammatical slot based on the particle that marks it.
 */
public record SlotAssignment(
        String word, // The word that fills the slot
        String slotName, // Name of the slot (SUBJECT, OBJECT, LOCATION, etc.)
        String particle, // The particle that marks this word
        int tokenIndex, // Position of the word in the token list
        int itemIndex // Index of the worksheet item containing this word
) {
}
