# Grammar Coach v3.0 - Pre-Implementation Summary

**Date:** 2025-12-25
**Status:** Ready for Implementation

---

## Existing Code State

### Backend Entities
| Entity | Current Fields |
|--------|----------------|
| `Vocab.java` | id, lessonId, displayForm, baseForm, partOfSpeech |
| `VocabTag.java` | id, name, category, description, examples |

### Backend Services
| Service | Key Methods |
|---------|-------------|
| `GrammarAnalysisService` | analyze(), detectOveruseStatistically(), evaluateRule(), calculateScore() |
| `WorksheetScannerService` | extractAllText() → `List<String>` (no location tracking) |
| `SudachiTokenizerService` | tokenize(), tokenizeWithPos(), normalizeWord() |

### Frontend Components
| Component | Current State |
|-----------|---------------|
| `GrammarCoachPanel.tsx` | v2.0 UI with score, POS distribution, violations |
| `CoachSidebar.tsx` | 3 tabs: vocab, grammar, style |
| `StyleCoachPanel.tsx` | Exists, marked for removal |

---

## Schema Changes Needed

### Vocab Entity
```java
// ADD these fields:
@Column(nullable = false)
private String category;  // person, thing, place, time, action, descriptor

@Column(columnDefinition = "TEXT")
private String aspects;  // JSON array: ["buyable", "school_related"]
```

### New Tables
- `slot_definition` - N5 grammatical slots with particle mappings
- `aspect_definition` - Vocabulary aspect definitions
- (Optional) Category definitions loaded from JSON

---

## Dependencies Status

| Dependency | Version | Status |
|------------|---------|--------|
| Spring Boot | 3.5.8 | ✅ Present |
| Java | 21 | ✅ Present |
| SQLite JDBC | 3.45.0 | ✅ Present |
| Lucene Kuromoji | 9.12.1 | ✅ Present |
| Commons CSV | 1.10.0 | ✅ Present |

**No new dependencies needed.**

---

## Field Name Mismatches (Fix in v3.0)

| Item Type | Scanner Uses | TypeScript Uses | Action |
|-----------|--------------|-----------------|--------|
| GRID | `boxes[].value` | `boxes[].char` | Fix Scanner |
| CLOZE | `passage` | `template` | Fix Scanner |
| MATCHING | `pairs[].match` | `pairs[].left/right` | Fix Scanner |

---

## Breaking Changes

### API Endpoint
- **v2.0**: `POST /api/grammar/analyze` → `GrammarAnalysisResult`
- **v3.0**: Same endpoint, new response structure with meta, distribution, diagnostics, slotAnalysis

### Decision: REPLACE v2.0 (no backward compatibility layer)

---

## Seed Data Created

| File | Content |
|------|---------|
| `slot_definitions.json` | 9 N5 slots (SUBJECT, OBJECT, LOCATION, etc.) |
| `aspect_definitions.json` | 21 vocabulary aspects (buyable, edible, vehicle, etc.) |
| `category_definitions.json` | 6 categories (person, thing, place, time, action, descriptor) |
| `test_worksheet.json` | Test data with VOCAB, CLOZE, GRID, MC, MATCHING items |

---

## Deferred to v4.0

- REARRANGE item type (doesn't exist yet)
- Notification watcher system (complex frontend state)
- Verb-specific slot constraints

---

## Ready for Implementation

- [x] Phase 0A Complete (Audit)
- [x] Phase 0B Complete (Gap Analysis)
- [x] Phase 0C Complete (Pre-Implementation)
- [ ] **NEXT: Proceed to Phase 1 in GRAMMAR_COACH_EXECUTION_GUIDE.md**
