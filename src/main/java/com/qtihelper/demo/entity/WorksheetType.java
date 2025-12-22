package com.qtihelper.demo.entity;

/**
 * Worksheet save type enumeration.
 * 
 * - AUTOSAVE: Automatically saved every 25 minutes or on blur. Max 10 per
 * parent.
 * - SNAPSHOT: User-triggered manual save with custom name. Unlimited.
 * - TEMPLATE: Developer-predefined template. Read-only.
 */
public enum WorksheetType {
    AUTOSAVE,
    SNAPSHOT,
    TEMPLATE
}
