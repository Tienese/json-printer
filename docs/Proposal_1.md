
Feature Proposal: Vocabulary Ingestion & Reference Sidebar

Objective:

Create a pipeline that reads single-column vocabulary CSVs from an external directory, filters out non-Japanese text (e.g., "IMC", "Mike Miller"), stores valid terms in SQLite, and serves them to the React sidebar for reference.

Status: Ready for Implementation

Dependencies: com.atilika.kuromoji:kuromoji-ipadic:0.9.0 (or similar)

1. Backend Implementation (Java)

A. External Directory Loader (VocabLoaderService)

We will read files from a folder outside the application JAR to allow you to tweak CSVs without recompiling.

Configuration: Add app.vocab-dir to your application.properties (e.g., ./csv).

Logic:

On startup (ApplicationRunner), check if the directory exists.

List all files matching lesson_(\d+).csv.

Extract lessonId from the filename.

Wipe & Reload: Execute DELETE FROM lesson_vocab to ensure the DB mirrors the file exactly.

B. The Filtering Logic (No English)

You requested to filter out "IMC" or Romaji entries automatically.

Strategy: We don't need Kuromoji for this specific step. A simple Regex check is faster and safer for filtering pure ASCII.

Filter Condition: !text.matches("^[\\x00-\\x7F]+$")

If text is purely ASCII characters (A-Z, 0-9), skip it.

If text contains Kanji, Hiragana, or Katakana, keep it.

C. Database Schema (lesson_vocab)

Even though the CSV has no explicit order column, we must generate one during insertion. If we rely on default SQL ordering, your words might appear randomized in the sidebar (Verbs mixed with Nouns), which is bad for study.

Table: lesson_vocab

| Column | Type | Notes |

| :--- | :--- | :--- |

| id | INTEGER PK | Auto-increment |

| lesson_id | INTEGER | From filename (e.g., 1) |

| original_text | TEXT | From CSV line (e.g., "わたし") |

| display_order | INTEGER | Generated: Line number from CSV |

D. API Endpoint (VocabController)

GET /api/vocab/{lessonId}

Response:

JSON


[

  { "id": 1, "text": "わたし" },

  { "id": 2, "text": "あなたが" }

]

Query: SELECT * FROM lesson_vocab WHERE lesson_id = ? ORDER BY display_order ASC

2. Frontend Implementation (React)

Sidebar Component (VocabPanel)

State:

vocabList: Array of objects from API.

checkedIds: Set of IDs manually clicked (saved in local component state for now).

Effect:

Listen to the "Worksheet Lesson" selection (if available) or a manual dropdown in the sidebar to fetch the correct list.

Render a list of <Checkbox label={item.text} />.

3. Assertions & Review Questions

Please verify these technical details against your current codebase:

Q1. File Path Resolution

Assertion: We will look for the csv/ folder in the Working Directory (where you run the java -jar command).

Check: Is this where you currently store your sqlite.db file? Or do you have a specific absolute path in mind?

Q2. Regex Strictness

Assertion: The Regex ^[\\x00-\\x7F]+$ filters out pure English strings like "IMC".

Edge Case: What if a line contains mixed text? e.g., "Note-book (notebukku)".

Current Proposal: It contains Japanese characters, so it will be KEPT.

Check: Is this acceptable behavior?

Q3. React State "Lesson" Awareness

Assertion: Your React app knows which lesson the current worksheet targets (maybe in metadata).

Check: Does the frontend already have access to a variable like currentLessonId? Or do we need to add a simple dropdown in the sidebar header ("Select Reference Lesson: [ 1 ]") for Phase 1?

Q4. Kuromoji Placement

Assertion: We are not using Kuromoji in Phase 1 (Data Loading). We are only using Regex for filtering. Kuromoji will be added in Phase 2 for the actual "Worksheet Analysis."

Check: Are you okay with adding the Kuromoji dependency now but leaving it unused until Phase 2? (Recommended to verify it builds correctly).

If these assertions hold true, you are ready to code the VocabLoaderService.