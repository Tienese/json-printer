# Phase 2 Technical Specifications: UI Restructure & Vocabulary Coach

## 1. Overview
This document outlines the technical implementation details for the Phase 2 UI Restructure. The primary goals are to consolidate the UI into a Menu Bar + Context Menu architecture and introduce the "Vocabulary Coach" feature, which requires new backend analysis capabilities.

## 2. Backend Architecture (Java/Spring Boot)

### 2.1 Database Schema (SQLite)
New entities are required to support the Vocabulary Coach feature, allowing the system to analyze worksheet content against known vocabulary lists (Lessons).

#### New Entity: `Lesson`
* **Table:** `lessons`
* **Columns:**
    * `id` (Long, PK, Auto Increment)
    * `name` (String, e.g., "Chapter 1", "Colors")
    * `category` (String, e.g., "Textbook A")

#### New Entity: `VocabularyTerm`
* **Table:** `vocabulary_terms`
* **Columns:**
    * `id` (Long, PK, Auto Increment)
    * `term` (String, indexed) - The word itself (e.g., "apple")
    * `meaning` (String) - Definition or translation
    * `lesson_id` (Long, FK to `lessons.id`)

### 2.2 API Endpoints

#### `POST /api/worksheets/{id}/analyze`
* **Purpose:** Analyzes the text content of a worksheet against a specific lesson (or all lessons) to determine vocabulary coverage.
* **Request Body:**
    ```json
    {
      "lessonId": 1  // Optional, if null, analyze against all or default
    }
    ```
* **Response:**
    ```json
    {
      "totalWords": 150,
      "uniqueWords": 45,
      "coveredWords": 10,
      "coveragePercent": 22.2,
      "missingWords": [
        { "term": "banana", "meaning": "yellow fruit", "lesson": "Chapter 1" }
      ],
      "foundWords": ["apple", "orange"]
    }
    ```
* **Implementation Logic:**
    1. Retrieve Worksheet by ID.
    2. Extract all text content from `jsonContent` (requires parsing the JSON structure: `pages[].items[].content` or similar fields depending on item type).
    3. Tokenize and normalize text (lowercase, remove punctuation).
    4. Query `VocabularyTerm` table for the selected Lesson.
    5. Calculate intersection and difference.

#### `GET /api/lessons`
* **Purpose:** Returns list of available lessons for the dropdown.
* **Response:** List of `Lesson` DTOs.

## 3. Frontend Architecture (React/TypeScript)

### 3.1 Component Restructure

#### `WorksheetPage.tsx`
* **Layout:** Grid layout `[Menu Bar (Top)]`, `[Main Content (Center)]`, `[Right Sidebar (Right)]`.
* **Left Sidebar:** Completely REMOVE.
* **Context Menu:**
    * **Canvas Background:** Prevent default context menu (no action).
    * **Paper/Print Area:** Right-click triggers "Add Element" menu.

#### `Sidebar.tsx` (Right Sidebar)
* **State:** Must manage a "Active Tab" state (Properties, Layers, Timeline, Vocab).
* **Tabs:**
    1. **Properties:** Renders existing attribute editors for selected item.
    2. **Layers:** Renders existing `LayersPanel`.
    3. **Timeline:** Renders `TimelineSidebar` (previously on left).
    4. **Vocab Coach:** Renders new `VocabCoachPanel`.

#### `VocabCoachPanel.tsx`
* **Props:** `worksheetId: number`, `onInsertWord: (word) => void`.
* **State:** `selectedLessonId`, `analysisResult`.
* **Behavior:**
    * Fetches lessons on mount.
    * "Analyze" button triggers `POST /api/worksheets/{id}/analyze`.
    * Displays stats and list of missing words.
    * Clicking a missing word triggers `onInsertWord` (adds a Vocab item to the worksheet).

#### `MenuBar.tsx`
* **Refinement:** Ensure "View", "Insert", and "Save" menus match the detailed UI spec.
* **State:** Dropdown open/close state managed locally.

### 4. Implementation Steps

#### Backend Engineer
1.  Create `Lesson` and `VocabularyTerm` entities.
2.  Create repository interfaces for new entities.
3.  Implement `VocabAnalysisService` (text extraction and comparison logic).
4.  Implement `VocabController` (endpoints).
5.  Add seed data (DemoController or data.sql) for testing (e.g., Lesson 1 with 10 words).

#### Frontend Engineer
1.  Refactor `Sidebar.tsx` to implement the Tab system.
2.  Move `TimelineSidebar` logic into the new Sidebar Tab.
3.  Create `VocabCoachPanel.tsx`.
4.  Update `WorksheetPage.tsx`:
    *   Remove `CoachSidebar` (Left).
    *   Update Grid layout.
    *   Ensure `MenuBar` is fully functional.
5.  Wire up `VocabCoachPanel` to the new API.

## 5. Data Migration / Backward Compatibility
* Existing worksheets do not need migration.
* New database tables will be created automatically by Hibernate (ensure `ddl-auto` is update).
