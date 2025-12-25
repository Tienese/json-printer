# Grammar Coach v3.0 - Phase 0C: Pre-Implementation

> **Purpose:** Final preparation before coding - create seed data, commit docs
> **Executor:** Opus 4.5
> **Prerequisites:** Complete PHASE 0A (Audit) and PHASE 0B (Gap Analysis) first!
> **Next Step:** After completing this, proceed to [GRAMMAR_COACH_EXECUTION_GUIDE.md](./GRAMMAR_COACH_EXECUTION_GUIDE.md)

---

## Prerequisites Check

Before starting this document, verify:

- [ ] **PHASE 0A COMPLETE:** [GRAMMAR_COACH_PHASE_0_AUDIT.md](./GRAMMAR_COACH_PHASE_0_AUDIT.md)
  - Audit report produced
  - All existing code documented

- [ ] **PHASE 0B COMPLETE:** [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md)
  - Gap analysis completed
  - Questions answered by user
  - All gaps addressed

**If prerequisites not complete, STOP and complete them first.**

---

## User Clarifications (From Gap Analysis)

These decisions were made during planning:

### Confirmed Decisions

| Question | Decision |
|----------|----------|
| REARRANGE item type | **DEFERRED to v4.0** - doesn't exist yet |
| Notification watcher | **DEFERRED to v4.0** - complex frontend state |
| Particle disambiguation | **Default mappings**: で→LOCATION, に→DIRECTION |
| Backward compatibility | **REPLACE v2.0** - no compatibility layer needed |
| Lesson scope default | **Fallback to ALL lessons** with HINT diagnostic |
| StyleCoachPanel | **DELETE** during Phase 5 |

### Field Name Resolution

TypeScript types are the **source of truth**. If Scanner uses different field names:
1. Check actual worksheet JSON in database
2. Fix Scanner to match TypeScript types

| Item | Should Use |
|------|------------|
| GRID | `sections[].boxes[].char` (not `value`) |
| CLOZE | `template` (not `passage`) |
| MATCHING | `pairs[].left` and `pairs[].right` (not `match`) |

**Action:** Verify these during implementation and fix Scanner if needed.

---

## 0.1 Read & Understand (Verify from Audit)

Read these files completely and confirm understanding:

- [ ] `GRAMMAR_ALGORITHM_SPEC.md` - Full algorithm specification
- [ ] `GRAMMAR_COACH_EXECUTION_GUIDE.md` - Implementation steps
- [ ] `1.1.1.1_RULES.md` - Coding standards (CRITICAL)
- [ ] `LANGUAGE_COACH_AUDIT_stage_0.md` - What already exists

**Confirm:** After reading, summarize the core changes in 3-5 bullet points to verify understanding.

---

## 0.2 Existing Code Audit

Read and document the current state of these files:

### Backend Services

| File | Read | Document Current State |
|------|------|------------------------|
| `src/main/java/com/qtihelper/demo/entity/Vocab.java` | [ ] | Current fields: _____ |
| `src/main/java/com/qtihelper/demo/service/GrammarAnalysisService.java` | [ ] | Current methods: _____ |
| `src/main/java/com/qtihelper/demo/service/WorksheetScannerService.java` | [ ] | Current return type: _____ |
| `src/main/java/com/qtihelper/demo/service/SudachiTokenizerService.java` | [ ] | Tokenization approach: _____ |
| `src/main/java/com/qtihelper/demo/dto/GrammarAnalysisResult.java` | [ ] | Current structure: _____ |

### Frontend Components

| File | Read | Document Current State |
|------|------|------------------------|
| `worksheet-ui/src/components/GrammarCoachPanel.tsx` | [ ] | Current UI elements: _____ |
| `worksheet-ui/src/components/CoachSidebar.tsx` | [ ] | How panels are organized: _____ |
| `worksheet-ui/src/components/VocabCoachPanel.tsx` | [ ] | Exists? Current function: _____ |
| `worksheet-ui/src/components/StyleCoachPanel.tsx` | [ ] | Exists? Marked for removal: _____ |

### Database/Repository

| File | Read | Document Current State |
|------|------|------------------------|
| `src/main/java/com/qtihelper/demo/repository/VocabRepository.java` | [ ] | Custom queries: _____ |
| `src/main/java/com/qtihelper/demo/entity/VocabTag.java` | [ ] | Current fields: _____ |

---

## 0.3 Database Schema Verification

### Current Vocab Table Structure

Run this to check current schema:
```bash
# If using SQLite, check the schema
sqlite3 data/app.db ".schema vocab"
```

Or read the entity file and document:
- Current columns in Vocab entity
- What needs to be added (category, aspects)
- Migration strategy (SQLite auto-updates with JPA)

### Verify JSON Column Support

SQLite stores JSON as TEXT. Verify:
- [ ] `aspects` field can be stored as TEXT with JSON content
- [ ] Application handles JSON serialization/deserialization

---

## 0.4 Create Seed Data Files

Create these seed data files for the algorithm to use:

### Slot Definitions Seed

**File to create:** `src/main/resources/data/slot_definitions.json`

```json
[
  {
    "name": "SUBJECT",
    "particles": ["は", "が"],
    "description": "Who performs the action",
    "humanTerm": "WHO",
    "questionWord": "だれ",
    "lessonIntroduced": 1
  },
  {
    "name": "OBJECT",
    "particles": ["を"],
    "description": "What receives the action",
    "humanTerm": "WHAT",
    "questionWord": "なに",
    "lessonIntroduced": 1
  },
  {
    "name": "LOCATION",
    "particles": ["で"],
    "description": "Where action happens",
    "humanTerm": "WHERE (at)",
    "questionWord": "どこで",
    "lessonIntroduced": 3
  },
  {
    "name": "DIRECTION",
    "particles": ["に", "へ"],
    "description": "Where going to",
    "humanTerm": "WHERE (to)",
    "questionWord": "どこに",
    "lessonIntroduced": 2
  },
  {
    "name": "TIME",
    "particles": ["に"],
    "description": "When action happens",
    "humanTerm": "WHEN",
    "questionWord": "いつ",
    "lessonIntroduced": 2
  },
  {
    "name": "INSTRUMENT",
    "particles": ["で"],
    "description": "Tool or means used",
    "humanTerm": "HOW/WITH WHAT",
    "questionWord": "なにで",
    "lessonIntroduced": 4
  },
  {
    "name": "COMPANION",
    "particles": ["と"],
    "description": "Who accompanies",
    "humanTerm": "WITH WHOM",
    "questionWord": "だれと",
    "lessonIntroduced": 3
  },
  {
    "name": "SOURCE",
    "particles": ["から"],
    "description": "Origin point",
    "humanTerm": "FROM WHERE",
    "questionWord": "どこから",
    "lessonIntroduced": 4
  },
  {
    "name": "GOAL",
    "particles": ["まで"],
    "description": "End point or limit",
    "humanTerm": "UNTIL",
    "questionWord": "どこまで",
    "lessonIntroduced": 4
  }
]
```

### Aspect Definitions Seed

**File to create:** `src/main/resources/data/aspect_definitions.json`

```json
[
  { "name": "buyable", "description": "Can be purchased", "applicableCategories": ["thing", "place"] },
  { "name": "giftable", "description": "Can be given as gift", "applicableCategories": ["thing"] },
  { "name": "edible", "description": "Can be eaten", "applicableCategories": ["thing"] },
  { "name": "drinkable", "description": "Can be drunk", "applicableCategories": ["thing"] },
  { "name": "wearable", "description": "Can be worn", "applicableCategories": ["thing"] },
  { "name": "readable", "description": "Can be read", "applicableCategories": ["thing"] },
  { "name": "vehicle", "description": "Used for transport", "applicableCategories": ["thing"] },
  { "name": "tool", "description": "Used as instrument", "applicableCategories": ["thing"] },
  { "name": "furniture", "description": "Home/office furniture", "applicableCategories": ["thing"] },
  { "name": "electronics", "description": "Electronic device", "applicableCategories": ["thing"] },
  { "name": "food", "description": "Food item", "applicableCategories": ["thing"] },
  { "name": "drink", "description": "Beverage", "applicableCategories": ["thing"] },
  { "name": "clothing", "description": "Clothing item", "applicableCategories": ["thing"] },
  { "name": "school_related", "description": "Related to school/education", "applicableCategories": ["thing", "place", "person"] },
  { "name": "work_related", "description": "Related to work/office", "applicableCategories": ["thing", "place", "person"] },
  { "name": "home_related", "description": "Related to home", "applicableCategories": ["thing", "place"] },
  { "name": "travel_related", "description": "Related to travel", "applicableCategories": ["thing", "place"] },
  { "name": "expensive", "description": "High cost", "applicableCategories": ["thing"] },
  { "name": "cheap", "description": "Low cost", "applicableCategories": ["thing"] },
  { "name": "animate", "description": "Living being", "applicableCategories": ["person", "thing"] },
  { "name": "inanimate", "description": "Non-living", "applicableCategories": ["thing", "place"] }
]
```

### Category Definitions

**File to create:** `src/main/resources/data/category_definitions.json`

```json
[
  { "name": "person", "description": "Human beings, roles, pronouns" },
  { "name": "thing", "description": "Physical objects" },
  { "name": "place", "description": "Locations, buildings" },
  { "name": "time", "description": "Time expressions" },
  { "name": "action", "description": "Verbs (ます form)" },
  { "name": "descriptor", "description": "Adjectives (い and な)" }
]
```

---

## 0.5 Create Test Data

### Test Worksheet JSON

**File to create:** `src/test/resources/test_worksheet.json`

Create a worksheet with:
- [ ] VOCAB items (5+)
- [ ] GRID items (2+)
- [ ] MULTIPLE_CHOICE items (2+)
- [ ] CLOZE items with blanks (2+)
- [ ] Mix of lessons (use Lesson 1 and 8 words)

Example structure:
```json
{
  "title": "Test Worksheet - Lesson 5",
  "pages": [
    {
      "items": [
        {
          "type": "VOCAB",
          "terms": [
            { "term": "学生", "meaning": "student" },
            { "term": "先生", "meaning": "teacher" },
            { "term": "学生", "meaning": "student" },
            { "term": "学生", "meaning": "student" }
          ]
        },
        {
          "type": "CLOZE",
          "passage": "わたしは＿＿＿をたべます。学校に＿＿＿。"
        },
        {
          "type": "GRID",
          "sections": [
            { "boxes": [{ "value": "学生" }, { "value": "先生" }] }
          ]
        }
      ]
    }
  ]
}
```

---

## 0.6 Dependency Check

### Backend (pom.xml)

Verify these exist:
- [ ] Kuromoji/Lucene Japanese analyzer
- [ ] Jackson for JSON processing
- [ ] Spring Boot JPA
- [ ] SQLite driver

If missing, document what to add.

### Frontend (package.json in worksheet-ui)

Verify these exist:
- [ ] React 18+
- [ ] TypeScript
- [ ] Tailwind CSS

---

## 0.7 API Contract Documentation

Document the API changes:

### Current Endpoint (v2.0)
```
POST /api/grammar/analyze
Request: { "worksheetJson": "..." }
Response: { totalWordsScanned, uniqueWordsFound, violations[], score }
```

### New Endpoint (v3.0)
```
POST /api/grammar-coach/analyze
Request: {
  "worksheetJson": "...",
  "lessonScope": {
    "mode": "range",
    "target": 5,
    "range": [1, 5]
  }
}
Response: GrammarCoachAnalysisResult (see spec)
```

### Breaking Changes
- [ ] Document v2.0 → v3.0 response changes
- [ ] Decide: Keep v2.0 endpoint or migrate?

---

## 0.8 Git Preparation

### Current State
- Branch: `feature/language-coach`
- Uncommitted changes: `GRAMMAR_ALGORITHM_SPEC.md` (modified)

### Pre-Implementation Commit

Create a commit with all planning documents:

```bash
git add GRAMMAR_ALGORITHM_SPEC.md
git add GRAMMAR_COACH_EXECUTION_GUIDE.md
git add GRAMMAR_COACH_PRE_IMPLEMENTATION.md
git commit -m "docs: Grammar Coach v3.0 planning complete

- Full algorithm specification (LSP-style analysis)
- SLOT system design with particle detection
- Category + Aspects tag system
- Cloze blank detection
- Notification watcher system
- Implementation priority phases

Ready for implementation.

🤖 Generated with Claude Code"
```

### Create Seed Data Commit (after 0.4)

```bash
git add src/main/resources/data/
git commit -m "data: Add seed data for Grammar Coach v3.0

- Slot definitions (N5 particles)
- Aspect definitions
- Category definitions

🤖 Generated with Claude Code"
```

---

## 0.9 Verification Checklist

Before proceeding to implementation, verify:

- [ ] All files in 0.1 read and understood
- [ ] All existing code in 0.2 audited and documented
- [ ] Database schema verified (0.3)
- [ ] Seed data files created (0.4)
- [ ] Test worksheet JSON created (0.5)
- [ ] Dependencies verified (0.6)
- [ ] API contract documented (0.7)
- [ ] Planning docs committed (0.8)

---

## 0.10 Gap Analysis (CRITICAL)

**Complete [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md) BEFORE proceeding.**

This questionnaire ensures 100% coverage of:
- All worksheet item types
- All edge cases
- All integration points
- All missing explanations

**Output:** List of gaps that need clarification from user.

**Do not proceed to implementation until all Critical Gaps are addressed.**

---

## 0.11 Output: Pre-Implementation Summary

After completing all above, write a summary:

```markdown
## Pre-Implementation Summary

### Existing Code State
- Vocab entity has fields: [list]
- GrammarAnalysisService has methods: [list]
- WorksheetScannerService returns: [type]

### Schema Changes Needed
- Add to Vocab: category (String), aspects (TEXT/JSON)
- Create new tables: slot_definition, aspect_definition

### Dependencies Status
- [x] Kuromoji: Present
- [x] Jackson: Present
- [ ] New deps needed: [none / list]

### Breaking Changes
- v2.0 endpoint will be: [kept / replaced / deprecated]

### Ready for Implementation
- [ ] YES - Proceed to GRAMMAR_COACH_EXECUTION_GUIDE.md Phase 1
```

---

## Next Steps

After completing this pre-implementation checklist:

1. Commit pre-implementation work
2. Create PR if needed for review
3. Proceed to [GRAMMAR_COACH_EXECUTION_GUIDE.md](./GRAMMAR_COACH_EXECUTION_GUIDE.md) Phase 1
