# Grammar Coach v3.0 - Audit Report

**Date:** 2025-12-25  
**Auditor:** Gemini CLI Agent  
**Status:** Phase 0A Complete - Ready for Gap Analysis

---

## Executive Summary

### Current State
Stage 0 foundation is implemented with basic grammar analysis capabilities.

| Category | Count | Status |
|----------|-------|--------|
| Entities | 6 | Vocab, VocabTag, VocabTagMapping, GrammarRule, RuleSuggestion, Worksheet |
| Services | 4 key | GrammarAnalysisService, WorksheetScannerService, SudachiTokenizerService, VocabSeederService |
| Frontend Components | 3 coach panels | GrammarCoachPanel, VocabCoachPanel, StyleCoachPanel in CoachSidebar |

### Key Findings

| Area | Current | v3.0 Gap |
|------|---------|----------|
| Vocab schema | id, lessonId, displayForm, baseForm, partOfSpeech | **Missing:** category, aspects columns |
| Threshold | Fixed: MAX(3, 15% of unique) | **Needs:** Dynamic lesson-aware calculation |
| Location tracking | Not implemented | **Needs:** itemIndex, charStart, charEnd per word |
| Slot system | Not implemented | **Needs:** SlotDefinition table, particle detection |
| Tag system | VocabTag exists (name, category) | **Needs:** Aspects as JSON array |

---

## Task 1: Key Rules Summary

From `1.1.1.1_RULES.md`:

| Rule | Summary |
|------|---------|
| 1 Component | Components only render; logic in hooks |
| 1 Style | Tailwind exclusively, print-first, no hover effects |
| 1 Design | Use shared primitives from `src/components/ui/` |
| 1 Architecture | Feature-based folders, SQLite persistence |
| Golden Rule | 1 Message = 1 Full Feature (batch Backend + Frontend) |

---

## Task 2: Backend Entities

### Vocab Entity
**File:** `entity/Vocab.java`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | @Id, auto-generated |
| lessonId | Integer | NOT NULL |
| displayForm | String | Original from CSV |
| baseForm | String | Kuromoji normalized |
| partOfSpeech | String | POS tag (e.g., 名詞-一般) |

**Missing for v3.0:** `category` (person/thing/place), `aspects` (JSON array)

### VocabTag Entity
**File:** `entity/VocabTag.java`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | @Id |
| name | String | UNIQUE (e.g., "transport") |
| category | String | "semantic", "grammar_role", "pos" |
| description | String | Nullable |
| examples | String | Comma-separated |

### VocabTagMapping Entity
**File:** `entity/VocabTagMapping.java`

- Join table for M2M: Vocab ↔ VocabTag
- Fields: id, vocab_id (FK), tag_id (FK)
- Unique constraint on (vocab_id, tag_id)

### GrammarRule Entity
**File:** `entity/GrammarRule.java`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | @Id |
| name | String | e.g., "honorific_variety" |
| ruleType | Enum | OVERUSE, MISSING, REQUIRES |
| targetTag | VocabTag | @ManyToOne, nullable |
| targetWord | String | Specific word, nullable |
| threshold | Integer | For OVERUSE |
| suggestionText | String | Max 500 chars |
| enabled | Boolean | Default true |
| priority | Integer | Higher = more important |

### RuleSuggestion Entity
**File:** `entity/RuleSuggestion.java`

- @ManyToOne to GrammarRule
- Fields: id, rule_id, suggestedWord, context, priority

### Worksheet Entity
**File:** `entity/Worksheet.java`

| Field | Type | Notes |
|-------|------|-------|
| id | Long | @Id |
| name | String | NOT NULL |
| jsonContent | String | @Lob TEXT, full worksheet JSON |
| createdAt/updatedAt | LocalDateTime | Auto-managed |
| type | WorksheetType | SNAPSHOT, TEMPLATE enum |
| parentId | Long | FK for autosaves |
| metadata | String | @Lob TEXT, JSON |

---

## Task 3: Backend Services

### GrammarAnalysisService
**File:** `service/GrammarAnalysisService.java` (244 lines)

| Method | Description |
|--------|-------------|
| `analyze(String worksheetJson)` | Main entry point - 7-step algorithm |
| `detectOveruseStatistically(Map<String, Integer>)` | v2.0 fixed threshold detection |
| `evaluateRule(GrammarRule, Map)` | Check single rule (OVERUSE only, MISSING/REQUIRES are TODO stubs) |
| `simplifyPos(String)` | "名詞-一般" → "名詞" |
| `calculateScore(List<RuleViolation>, int)` | 100 - (severity per violation) |

**Current Algorithm v2.0 - Detailed Pseudocode:**

```
FUNCTION analyze(worksheetJson):
    // Step 1: Load vocab base forms from DB for filtering
    vocabBaseForms = vocabRepository.findAll().map(Vocab::getBaseForm)

    // Step 2: Extract text from worksheet (all pages, all items)
    textBlocks = scannerService.extractAllText(worksheetJson)

    // Step 3: Tokenize and count ONLY words in vocab database
    FOR text IN textBlocks:
        tokens = tokenizerService.tokenizeWithPos(text)
        FOR token IN tokens:
            IF vocabBaseForms.contains(token.baseForm):
                wordCounts[token.baseForm]++
                posCounts[simplifyPos(token.pos)]++

    // Step 4: Detect overuse statistically
    violations = detectOveruseStatistically(wordCounts)

    // Step 5: Check explicit rules from database
    FOR rule IN ruleService.getEnabledRules():
        violation = evaluateRule(rule, wordCounts)
        IF violation AND not already flagged:
            violations.add(violation)

    // Step 6: Calculate score
    score = calculateScore(violations, totalVocabWords)

    // Step 7: Build result
    RETURN GrammarAnalysisResult(totalWordsScanned, uniqueWords, posCounts, violations, score)

FUNCTION detectOveruseStatistically(wordCounts):
    // FIXED threshold (v2.0)
    threshold = MAX(3, ceil(uniqueWords * 0.15))
    
    FOR word, count IN wordCounts:
        IF count > threshold:
            violations.add(RuleViolation(word, count, threshold))
    RETURN violations

FUNCTION calculateScore(violations, totalWords):
    score = 100
    FOR violation IN violations:
        severity = MIN(20, (actualCount - threshold) * 5)
        score -= severity
    RETURN MAX(0, MIN(100, score))
```

**Key Limitations of v2.0:**
- No location tracking (item index, character position)
- No lesson scope filtering (loads ALL vocab from DB)
- MISSING and REQUIRES rule types not implemented (TODO stubs)
- No category/aspect-based analysis
- Suggestions only from explicit GrammarRule, not dynamic

### VocabSeederService
**File:** `service/VocabSeederService.java` (127 lines)

**Startup Behavior:** Implements `CommandLineRunner` - runs on app startup

```
ON APPLICATION STARTUP:
    1. Scan csv/ directory for lesson_*.csv files
    2. FOR EACH matching file:
        a. Parse lesson ID from filename (e.g., lesson_8.csv → 8)
        b. DELETE existing vocab for this lesson (WIPE policy)
        c. Read CSV file (UTF-8, single column)
        d. FOR EACH line:
            - Skip empty/comment lines
            - Normalize to base form via Kuromoji
            - Extract POS tag
            - Create Vocab(lessonId, displayForm, baseForm, pos)
        e. Bulk save to database
```

**CSV Format:**
```
# Single column, UTF-8, no header
わたし
あなた
あの人
先生
学生
...
```

### WorksheetScannerService
**File:** `service/WorksheetScannerService.java`

| Method | Handles |
|--------|---------|
| `extractAllText(String json)` | Entry point |
| `extractVocabTerms()` | VOCAB → terms[].term |
| `extractGridBoxes()` | GRID → sections[].boxes[].value |
| `extractMCOptions()` | MULTIPLE_CHOICE → questions[].options[].text |
| `extractMatchingMatches()` | MATCHING → pairs[].match |
| `extractClozePassage()` | CLOZE → passage |

**Coverage:**
- ✅ VOCAB, GRID, MULTIPLE_CHOICE, MATCHING, CLOZE, CARD
- ⏭️ TRUE_FALSE (skipped - prompts only)
- ⏭️ HEADER (skipped - metadata)
- ❌ REARRANGE - **Not handled**

### SudachiTokenizerService
**File:** `service/SudachiTokenizerService.java`

- **Library:** Lucene Kuromoji (`lucene-analysis-kuromoji` v9.12.1)
- **Not Sudachi** despite the name
- `tokenize(String)` → List<String> base forms
- `tokenizeWithPos(String)` → List<TokenResult(surface, baseForm, pos)>
- Filters: 助詞 (particles), 記号 (symbols), 補助記号

---

## Task 4: Backend DTOs

### GrammarAnalysisResult
**File:** `dto/GrammarAnalysisResult.java`

```java
public record GrammarAnalysisResult(
    int totalWordsScanned,
    int uniqueWordsFound,
    List<PosCount> posCounts,
    List<RuleViolation> violations,
    int score
) {
    public record PosCount(String pos, int count) {}
    public record RuleViolation(
        Long ruleId, String ruleName, String ruleType,
        String targetWord, int actualCount, int threshold,
        String message, List<String> suggestions
    ) {}
}
```

**Missing for v3.0:** meta, distribution, diagnostics, slotAnalysis, validity fields

---

## Task 5-6: Controllers & Repositories

### Endpoints (from Stage 0 Audit)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/grammar/analyze` | Analyze JSON directly |
| POST | `/api/worksheets/{id}/analyze-grammar` | Analyze by ID |
| CRUD | `/api/vocab-tags` | Tag management |
| CRUD | `/api/grammar-rules` | Rule management |

### Repositories
| Repository | Custom Methods |
|------------|----------------|
| VocabRepository | findByLessonId, findByBaseForm |
| VocabTagRepository | findByName, findByCategory |
| GrammarRuleRepository | findByEnabledTrueOrderByPriorityDesc |

---

## Task 7: Frontend Components

### CoachSidebar
**File:** `components/CoachSidebar.tsx`

- 3 tabs: `vocab`, `grammar`, `style`
- Props: worksheetId, worksheetJson, isOpen, onToggle, onInsertVocabWord
- Collapsible 300px → 40px

### GrammarCoachPanel
**File:** `components/GrammarCoachPanel.tsx`

- Props: worksheetId, worksheetJson
- State: result, isLoading, error
- Calls: `/api/worksheets/{id}/analyze-grammar` or `/api/grammar/analyze`
- Displays: score (colored), POS distribution, violations with suggestions

**Missing for v3.0:** Clickable locations, notification watcher, slot analysis tab

### Other Panels
- `VocabCoachPanel.tsx` - Vocab gap analysis
- `StyleCoachPanel.tsx` - Style checking (marked for removal per spec)

---

## Task 8-9: Types & Sample Data

### Worksheet TypeScript Types
**File:** `worksheet-ui/src/types/worksheet.ts` (214 lines)

```typescript
// Union of all item types
type WorksheetItem =
  | HeaderItem | CardItem | GridItem | VocabItem
  | MultipleChoiceItem | TrueFalseItem | MatchingItem | ClozeItem;

// Core structures
interface WorksheetState {
  pages: WorksheetPage[];
  currentPageIndex: number;
  selectedItem: WorksheetItem | null;
  mode: 'student' | 'teacher';
  metadata: WorksheetMetadata;
}

interface WorksheetPage {
  id: string;
  items: WorksheetItem[];
}
```

### Item Type Structures (All 8 Types)

| Type | JSON Structure | Key Fields |
|------|----------------|------------|
| `HeaderItem` | `{ type: 'HEADER', title, showName, showDate }` | title, fontSize, textAlign |
| `CardItem` | `{ type: 'CARD', content, language }` | content, cardStyle, columns |
| `GridItem` | `{ type: 'GRID', sections: [{ boxes }], boxSize }` | sections[].boxes[].char/furigana, columns, rows |
| `VocabItem` | `{ type: 'VOCAB', terms: [{ term, meaning }] }` | terms[].term/meaning, listStyle |
| `MultipleChoiceItem` | `{ type: 'MULTIPLE_CHOICE', prompt, options[], correctIndex }` | options (string[]) |
| `TrueFalseItem` | `{ type: 'TRUE_FALSE', questions: [{ text, correctAnswer }] }` | questions[].text/correctAnswer |
| `MatchingItem` | `{ type: 'MATCHING', pairs: [{ left, right }] }` | pairs[].left/right |
| `ClozeItem` | `{ type: 'CLOZE', template, answers[] }` | template with blanks, answers[] |

### What WorksheetScannerService Extracts

| Item Type | Fields Extracted | Fields Ignored |
|-----------|------------------|----------------|
| VOCAB | `terms[].term` | `terms[].meaning` (Vietnamese) |
| GRID | `sections[].boxes[].value` | section labels |
| MULTIPLE_CHOICE | `questions[].options[].text` | `questions[].prompt` |
| MATCHING | `pairs[].match` | `pairs[].prompt` |
| CLOZE | `passage` | - |
| TRUE_FALSE | - | All (prompts only) |
| HEADER | - | All (metadata) |
| CARD | `content` (if Japanese) | - |
| **REARRANGE** | **NOT IMPLEMENTED** | - |

### CSV Sample Data
**Format:** Single column, UTF-8, no header
**File pattern:** `csv/lesson_*.csv`

```csv
# lesson_1.csv (36 words)
わたし
あなた
あの人
先生
学生
会社員
医者
大学
病院
日本
...
```

---

## Task 10: Dependencies

### Backend (pom.xml)
| Dependency | Version |
|------------|---------|
| Spring Boot | 3.5.8 |
| Java | 21 |
| SQLite JDBC | 3.45.0.0 |
| Lucene Kuromoji | 9.12.1 |
| Commons CSV | 1.10.0 |

### Frontend (worksheet-ui)
| Dependency | Version |
|------------|---------|
| Node | v22.12.0 |
| NPM | 10.9.0 |
| React | (Vite-based) |
| Tailwind | (configured) |

---

## Summary: What Exists vs What's Needed

| Component | Exists | v3.0 Needs |
|-----------|--------|------------|
| Vocab entity | ✅ | Add category, aspects columns |
| VocabTag entity | ✅ | Works as-is |
| SlotDefinition table | ❌ | Create new entity |
| WorksheetScannerService | ✅ | Add location tracking, REARRANGE support |
| GrammarAnalysisService | ✅ | Rewrite for v3.0 algorithm |
| GrammarAnalysisResult DTO | ✅ | Redesign for v3.0 response |
| CoachSidebar | ✅ | Rename tabs to Distribution/Suggestions/Patterns |
| GrammarCoachPanel | ✅ | Major rewrite for new UI |
| StyleCoachPanel | ✅ | Mark for removal |
| Notification watcher | ❌ | New feature |
| Cloze blank detection | ❌ | New feature |

---

## Ready for Gap Analysis

Proceed to: [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md)
