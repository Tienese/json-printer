# Grammar Coach v3.0 - Phase 0: Codebase Audit

> **Purpose:** Scan and document the CURRENT state of the codebase BEFORE any implementation planning.
> **Executor:** Opus 4.5
> **Output:** Audit report with current state documented
> **Next Step:** After audit, proceed to [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md)

---

## Execution Order (Correct Flow)

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 0A: AUDIT (This Document)                            │
│  ├─ Scan all existing files                                 │
│  ├─ Document current state                                  │
│  └─ Output: Audit Report                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 0B: GAP ANALYSIS                                     │
│  ├─ Read GRAMMAR_ALGORITHM_SPEC.md                          │
│  ├─ Compare spec vs audit findings                          │
│  ├─ Identify missing pieces                                 │
│  └─ Output: Gaps List + Questions for User                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 0C: PRE-IMPLEMENTATION                               │
│  ├─ User answers questions                                  │
│  ├─ Create seed data files                                  │
│  ├─ Commit all planning docs                                │
│  └─ Output: Ready for Implementation                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASES 1-5: IMPLEMENTATION                                 │
│  └─ Follow GRAMMAR_COACH_EXECUTION_GUIDE.md                 │
└─────────────────────────────────────────────────────────────┘
```

---

## AUDIT TASK 1: Read Configuration Files

Read and summarize:

### 1.1 Project Rules
- [ ] Read `1.1.1.1_RULES.md`
- [ ] Read `CLAUDE.md` or `GEMINI.md`

**Output:** List key rules that affect implementation

```markdown
### Key Rules Summary
- 1 Component: [summary]
- 1 Style: [summary]
- 1 Design: [summary]
- 1 Architecture: [summary]
- Golden Rule: [summary]
```

### 1.2 Existing Audit
- [ ] Read `LANGUAGE_COACH_AUDIT_stage_0.md`

**Output:** What's already implemented

```markdown
### Already Implemented (Stage 0)
- Entities: [list]
- Services: [list]
- Controllers: [list]
- Frontend: [list]
```

---

## AUDIT TASK 2: Scan Backend Entities

For EACH entity file, document:

### 2.1 Vocab Entity
**File:** `src/main/java/com/qtihelper/demo/entity/Vocab.java`

```markdown
### Vocab Entity
- Fields: [list all fields with types]
- Annotations: [JPA annotations used]
- Relationships: [any @ManyToOne, @OneToMany]
- Missing for v3.0: [what needs to be added]
```

### 2.2 VocabTag Entity
**File:** `src/main/java/com/qtihelper/demo/entity/VocabTag.java`

```markdown
### VocabTag Entity
- Fields: [list]
- Purpose: [what is this for]
```

### 2.3 VocabTagMapping Entity
**File:** `src/main/java/com/qtihelper/demo/entity/VocabTagMapping.java`

```markdown
### VocabTagMapping Entity
- Fields: [list]
- Relationship structure: [how does it link vocab to tags]
```

### 2.4 GrammarRule Entity
**File:** `src/main/java/com/qtihelper/demo/entity/GrammarRule.java`

```markdown
### GrammarRule Entity
- Fields: [list]
- RuleType enum values: [list]
```

### 2.5 RuleSuggestion Entity
**File:** `src/main/java/com/qtihelper/demo/entity/RuleSuggestion.java`

```markdown
### RuleSuggestion Entity
- Fields: [list]
- Relationship to GrammarRule: [how linked]
```

### 2.6 Worksheet Entity
**File:** `src/main/java/com/qtihelper/demo/entity/Worksheet.java`

```markdown
### Worksheet Entity
- Fields: [list]
- How is worksheet JSON stored: [column type, format]
```

---

## AUDIT TASK 3: Scan Backend Services

For EACH service file, document all methods:

### 3.1 GrammarAnalysisService
**File:** `src/main/java/com/qtihelper/demo/service/GrammarAnalysisService.java`

```markdown
### GrammarAnalysisService Methods
| Method | Parameters | Returns | What It Does |
|--------|------------|---------|--------------|
| analyze() | | | |
| [other methods] | | | |

### Current Algorithm (v2.0)
- How threshold is calculated: [describe]
- What it counts: [describe]
- What it returns: [describe]
```

### 3.2 WorksheetScannerService
**File:** `src/main/java/com/qtihelper/demo/service/WorksheetScannerService.java`

```markdown
### WorksheetScannerService Methods
| Method | Parameters | Returns | What It Does |
|--------|------------|---------|--------------|
| extractAllText() | | | |
| [other methods] | | | |

### Extraction Logic
- How it handles VOCAB items: [describe]
- How it handles GRID items: [describe]
- How it handles MULTIPLE_CHOICE: [describe]
- How it handles CLOZE: [describe]
- How it handles other types: [describe]
```

### 3.3 SudachiTokenizerService
**File:** `src/main/java/com/qtihelper/demo/service/SudachiTokenizerService.java`

```markdown
### SudachiTokenizerService Methods
| Method | Parameters | Returns | What It Does |
|--------|------------|---------|--------------|
| tokenizeWithPos() | | | |
| normalizeWord() | | | |
| [other methods] | | | |

### Tokenization Details
- What library is used: [Kuromoji/Lucene/etc]
- What POS tags are returned: [examples]
- How base form is extracted: [describe]
```

### 3.4 VocabSeederService
**File:** `src/main/java/com/qtihelper/demo/service/VocabSeederService.java`

```markdown
### VocabSeederService Methods
- How CSV is imported: [describe]
- What columns are expected: [list]
- How POS is extracted: [describe]
```

### 3.5 GrammarRuleService
**File:** `src/main/java/com/qtihelper/demo/service/GrammarRuleService.java`

```markdown
### GrammarRuleService Methods
- CRUD methods: [list]
- getEnabledRules(): [what it returns]
- seedDefaultRules(): [what rules are seeded]
```

### 3.6 VocabTagService
**File:** `src/main/java/com/qtihelper/demo/service/VocabTagService.java`

```markdown
### VocabTagService Methods
- CRUD methods: [list]
- seedDefaultTags(): [what tags are seeded]
```

---

## AUDIT TASK 4: Scan Backend DTOs

### 4.1 GrammarAnalysisResult
**File:** `src/main/java/com/qtihelper/demo/dto/GrammarAnalysisResult.java`

```markdown
### GrammarAnalysisResult Structure
```java
// Copy the exact current structure here
```

### Other DTOs
- List any other DTOs in the dto folder
```

---

## AUDIT TASK 5: Scan Backend Controllers

### 5.1 GrammarRuleController
**File:** `src/main/java/com/qtihelper/demo/controller/GrammarRuleController.java`

```markdown
### Endpoints
| HTTP Method | URL | Request Body | Response | Description |
|-------------|-----|--------------|----------|-------------|
| POST | /api/grammar/analyze | | | |
| POST | /api/worksheets/{id}/analyze-grammar | | | |
| [other endpoints] | | | | |
```

### 5.2 VocabTagController
**File:** `src/main/java/com/qtihelper/demo/controller/VocabTagController.java`

```markdown
### Endpoints
[list all endpoints]
```

---

## AUDIT TASK 6: Scan Backend Repositories

### 6.1 VocabRepository
**File:** `src/main/java/com/qtihelper/demo/repository/VocabRepository.java`

```markdown
### Custom Query Methods
| Method | Query | Purpose |
|--------|-------|---------|
| | | |
```

### 6.2 Other Repositories
- List all repository files and their custom methods

---

## AUDIT TASK 7: Scan Frontend Components

### 7.1 GrammarCoachPanel
**File:** `worksheet-ui/src/components/GrammarCoachPanel.tsx`

```markdown
### GrammarCoachPanel Component
- Props: [list]
- State: [what useState hooks]
- API calls: [what endpoints called]
- Rendered UI: [describe what's shown]
```

### 7.2 CoachSidebar
**File:** `worksheet-ui/src/components/CoachSidebar.tsx`

```markdown
### CoachSidebar Component
- Child panels: [list]
- How panels are organized: [tabs? accordion?]
```

### 7.3 VocabCoachPanel (if exists)
```markdown
### VocabCoachPanel Component
- Exists: [yes/no]
- Purpose: [describe]
```

### 7.4 StyleCoachPanel (if exists)
```markdown
### StyleCoachPanel Component
- Exists: [yes/no]
- Purpose: [describe]
- Marked for removal: [yes - per spec]
```

### 7.5 Worksheet Editor Components
Scan for how worksheet items are rendered:

```markdown
### Worksheet Item Rendering
- Main editor component: [filename]
- How items are stored in state: [describe]
- Item type detection: [how does it know VOCAB vs GRID]
```

---

## AUDIT TASK 8: Scan Frontend Types

### 8.1 Type Definitions
**Folder:** `worksheet-ui/src/types/` or inline in components

```markdown
### Key Type Definitions
```typescript
// Copy relevant type definitions here
// Especially worksheet item types
```
```

---

## AUDIT TASK 9: Examine Sample Data

### 9.1 CSV Files
**Folder:** `csv/`

```markdown
### CSV Structure
- Files found: [list]
- Column format: [describe]
- Sample row: [example]
```

### 9.2 Sample Worksheet JSON
Find an example worksheet JSON (in tests, or from database):

```markdown
### Worksheet JSON Structure
```json
// Paste actual worksheet JSON structure here
// Focus on item type formats
```
```

---

## AUDIT TASK 10: Check Dependencies

### 10.1 pom.xml
```markdown
### Backend Dependencies
- Japanese tokenizer: [what library, version]
- JSON processing: [Jackson?]
- Database: [SQLite driver?]
```

### 10.2 package.json (worksheet-ui)
```markdown
### Frontend Dependencies
- React version: []
- TypeScript version: []
- Tailwind version: []
- Any UI component library: []
```

---

## AUDIT OUTPUT

After completing all tasks, produce this audit report:

```markdown
# Grammar Coach v3.0 - Audit Report

**Date:** [date]
**Auditor:** Opus 4.5

## Executive Summary

### Current State
- Stage 0 implementation complete
- [X] entities exist
- [X] services exist
- [X] frontend components exist

### Key Findings

#### Backend
- Vocab entity has fields: [list]
- GrammarAnalysisService uses algorithm: [describe v2.0]
- WorksheetScannerService extracts: [describe]

#### Frontend
- GrammarCoachPanel shows: [describe]
- Worksheet items are structured as: [describe]

### Worksheet Item Types Found
| Type | JSON Structure | Currently Analyzed? |
|------|----------------|---------------------|
| VOCAB | { term, meaning } | Yes |
| GRID | { ... } | Yes |
| MULTIPLE_CHOICE | { ... } | Yes |
| CLOZE | { ... } | Yes |
| REARRANGE | { ... } or NOT FOUND | ? |
| ... | | |

### Integration Points
- New services will integrate with: [list existing services]
- Frontend will modify: [list components]

## Detailed Findings

[Paste all the detailed findings from Tasks 1-10]

## Ready for Gap Analysis

Proceed to: GRAMMAR_COACH_GAP_ANALYSIS.md
```

---

## Next Step

After completing this audit:
1. Save the audit report
2. Proceed to [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md)
3. Compare audit findings against spec requirements
