# Grammar Coach v3.0 - Execution Guide

> **Purpose:** Step-by-step implementation guide for the Grammar Coach v3.0 algorithm.
> **Executor:** Opus 4.5 (or any capable model)
> **Specification:** See [GRAMMAR_ALGORITHM_SPEC.md](./GRAMMAR_ALGORITHM_SPEC.md) for full details.

---

## STOP: Complete Phase 0 First

**Before starting this guide, complete ALL Phase 0 steps:**

- [ ] **PHASE 0A:** [GRAMMAR_COACH_PHASE_0_AUDIT.md](./GRAMMAR_COACH_PHASE_0_AUDIT.md) - Scan codebase
- [ ] **PHASE 0B:** [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md) - Identify gaps
- [ ] **PHASE 0C:** [GRAMMAR_COACH_PRE_IMPLEMENTATION.md](./GRAMMAR_COACH_PRE_IMPLEMENTATION.md) - Create seed data, commit

**Do not proceed until Phase 0 is complete, gaps are addressed, and docs are committed.**

---

## Execution Flow

```
PHASE 0A: AUDIT (GRAMMAR_COACH_PHASE_0_AUDIT.md)
├─ Scan all existing code
├─ Document current state
└─ Output: Audit Report
            ↓
PHASE 0B: GAP ANALYSIS (GRAMMAR_COACH_GAP_ANALYSIS.md)
├─ Compare spec vs audit
├─ Identify missing pieces
├─ Ask user questions
└─ Output: Gaps Resolved
            ↓
PHASE 0C: PRE-IMPLEMENTATION (GRAMMAR_COACH_PRE_IMPLEMENTATION.md)
├─ Create seed data files
├─ Commit all planning docs
└─ Output: PR for Review
            ↓
PHASES 1-5: IMPLEMENTATION (This file)
├─ Phase 1: Foundation
├─ Phase 2: Core Analysis
├─ Phase 3: Enhanced Features
├─ Phase 4: UI Integration
└─ Phase 5: Polish
            ↓
FINAL: Update LANGUAGE_COACH_AUDIT_stage_1.md
```

---

## Execution Rules

### 1.1.1.1 Compliance (CRITICAL)
- **1 Component:** Logic in hooks, components only render
- **1 Style:** Tailwind only, no hover effects, print-first
- **1 Design:** Use existing UI primitives from `src/components/ui/`
- **1 Architecture:** Feature-based folders, batch backend+frontend changes

### Golden Rule
**1 Message = 1 Full Feature Implementation (Backend + Frontend)**

### Important Clarifications

| Topic | Decision |
|-------|----------|
| **API Endpoint** | Keep same URL `/api/grammar/analyze` - replacing v2.0 response structure |
| **Tokenizer Naming** | `SudachiTokenizerService` uses Kuromoji internally (naming is legacy) |
| **Test Data** | Use Lesson 1 and Lesson 8 vocabulary (matches existing database) |
| **TypeScript = Truth** | When Scanner and TypeScript types disagree, fix Scanner to match TypeScript |

### File Naming Conventions
- Java: `PascalCase.java` (e.g., `SlotDefinition.java`)
- TypeScript: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils
- DTOs: Java records only

---

## Existing Files to MODIFY (Not Replace)

| File | Location | What to Add |
|------|----------|-------------|
| `Vocab.java` | `src/main/java/.../entity/` | Add `category`, `aspects` fields |
| `GrammarAnalysisService.java` | `src/main/java/.../service/` | Refactor to v3.0 algorithm |
| `WorksheetScannerService.java` | `src/main/java/.../service/` | Add location tracking |
| `GrammarAnalysisResult.java` | `src/main/java/.../dto/` | Update to v3.0 response structure |
| `GrammarCoachPanel.tsx` | `worksheet-ui/src/components/` | Update to unified Language Coach UI |

## New Files to CREATE

### Backend (Java)

| File | Location | Purpose |
|------|----------|---------|
| `SlotDefinition.java` | `entity/` | Slot definitions table |
| `SlotDefaultTags.java` | `entity/` | Tags accepted by slots |
| `AspectDefinition.java` | `entity/` | Aspect vocabulary |
| `SlotDefinitionRepository.java` | `repository/` | Slot queries |
| `SlotDetectionService.java` | `service/` | Particle-based slot detection |
| `DistributionAnalysisService.java` | `service/` | Word frequency analysis |
| `ValidityCalculationService.java` | `service/` | Coverage and validity |
| `DiagnosticGeneratorService.java` | `service/` | ERROR/WARNING/INFO/HINT generation |
| `ClozeAnalysisService.java` | `service/` | Blank detection in cloze questions |
| `ComplianceValidatorService.java` | `service/` | ます形 enforcement |

### Frontend (TypeScript)

| File | Location | Purpose |
|------|----------|---------|
| `LanguageCoachPanel.tsx` | `components/` | Unified coach with tabs |
| `useLanguageCoach.ts` | `hooks/` | Analysis logic hook |
| `useNotificationWatcher.ts` | `hooks/` | Smart dismissal logic |
| `DistributionTab.tsx` | `components/coach/` | Word frequency tab |
| `SuggestionsTab.tsx` | `components/coach/` | Recommendations tab |
| `PatternsTab.tsx` | `components/coach/` | Slot coverage tab |
| `DiagnosticCard.tsx` | `components/coach/` | Single diagnostic display |
| `LocationLink.tsx` | `components/coach/` | Clickable location |

---

## Phase 1: Foundation (MUST COMPLETE FIRST)

### Step 1.0: Fix Scanner Field Name Mismatches (DO THIS FIRST)

**File:** `src/main/java/com/qtihelper/demo/service/WorksheetScannerService.java`

**CRITICAL:** Fix these before other work - everything depends on correct extraction.

| Item Type | Scanner Currently Uses | Should Use (TypeScript is source of truth) |
|-----------|------------------------|---------------------------------------------|
| GRID | `boxes[].value` | `sections[].boxes[].char` |
| CLOZE | `passage` | `template` |
| MATCHING | `pairs[].match` | `pairs[].left` and `pairs[].right` |

**Steps:**
1. Read actual worksheet JSON from database to verify field names
2. Update Scanner extraction methods to match TypeScript types
3. Test extraction with existing worksheets

**Acceptance Criteria:**
- [ ] GRID extracts from `sections[].boxes[].char`
- [ ] CLOZE extracts from `template`
- [ ] MATCHING extracts from `pairs[].left` and `pairs[].right`
- [ ] Existing worksheets still parse correctly

---

### Step 1.1: Update Vocab Entity

**File:** `src/main/java/com/qtihelper/demo/entity/Vocab.java`

```java
// ADD these fields:
@Column(nullable = false)
private String category;  // person, thing, place, time, action, descriptor

@Column(columnDefinition = "TEXT")
private String aspects;  // JSON array: ["buyable", "school_related"]
```

**Acceptance Criteria:**
- [ ] Entity compiles
- [ ] `mvn compile` passes
- [ ] Can store category and aspects

### Step 1.2: Create Slot Definitions

**File:** `src/main/java/com/qtihelper/demo/entity/SlotDefinition.java`

Create entity matching schema in spec:
- id, name, particles (JSON), description, lessonIntroduced

**Acceptance Criteria:**
- [ ] Entity created with JPA annotations
- [ ] Repository created with basic CRUD
- [ ] Can seed N5 slots (SUBJECT, OBJECT, LOCATION, etc.)

### Step 1.3: Update WorksheetScannerService

**File:** `src/main/java/com/qtihelper/demo/service/WorksheetScannerService.java`

Modify `extractAllText()` to return `List<ExtractedSegment>` with:
- text
- itemIndex
- itemType
- sentenceIndex (if applicable)

**Acceptance Criteria:**
- [ ] Returns structured data instead of flat string
- [ ] Tracks which item each word came from
- [ ] Detects sentence boundaries (。)

### Step 1.4: Particle Detection Service

**File:** `src/main/java/com/qtihelper/demo/service/SlotDetectionService.java`

New service that:
- Takes tokenized text
- Identifies particles (助詞)
- Maps particle → slot
- Returns `List<SlotAssignment>`

**Acceptance Criteria:**
- [ ] Correctly identifies を → OBJECT
- [ ] Correctly identifies に → DIRECTION or TIME
- [ ] Correctly identifies で → LOCATION or INSTRUMENT
- [ ] Returns word + slot + position

### Step 1.5: Lesson Scope Filtering

**Modify:** `GrammarAnalysisService.java`

Add parameter for lesson scope:
```java
public GrammarCoachResult analyze(String worksheetJson, LessonScope scope)
```

Filter vocab queries by lesson range.

**Acceptance Criteria:**
- [ ] Can analyze for single lesson
- [ ] Can analyze for lesson range
- [ ] Target lesson gets HIGH priority

---

## Phase 2: Core Analysis

### Step 2.1: Distribution Analysis Service

**File:** `src/main/java/com/qtihelper/demo/service/DistributionAnalysisService.java`

Calculate:
- Word frequency
- Expected per word
- Standard deviation
- Overuse threshold (expected + 2σ)

**Acceptance Criteria:**
- [ ] Correctly calculates statistics
- [ ] Identifies overused words
- [ ] Identifies underused words

### Step 2.2: Validity Calculation Service

**File:** `src/main/java/com/qtihelper/demo/service/ValidityCalculationService.java`

Calculate:
- Overall coverage (unique / pool)
- Category coverage
- Validity level (HIGH/MEDIUM/LOW)
- Human-readable validity note

**Acceptance Criteria:**
- [ ] Returns validity based on coverage thresholds
- [ ] Generates contextual notes
- [ ] Accounts for category balance

### Step 2.3: Diagnostic Generator Service

**File:** `src/main/java/com/qtihelper/demo/service/DiagnosticGeneratorService.java`

Generate diagnostics with:
- Severity (ERROR/WARNING/INFO/HINT)
- Type (OVERUSE/UNDERUSE/CATEGORY_IMBALANCE/etc.)
- Message
- Locations
- Suggestions (primary + secondary)

**Acceptance Criteria:**
- [ ] ERROR for 3σ+ overuse
- [ ] WARNING for 2σ overuse
- [ ] INFO for underused suggestions
- [ ] HINT for validity notes

### Step 2.4: Score Calculation

Implement weighted formula:
```
score = 100 - (errors × 15) - (warnings × 5) - (imbalance × 10) - validity_penalty
```

**Acceptance Criteria:**
- [ ] Score 0-100
- [ ] Interpretation label (Excellent/Good/Needs Work/Review Required)

### Step 2.5: Update API Response

**File:** `src/main/java/com/qtihelper/demo/dto/GrammarAnalysisResult.java`

Completely rewrite to match v3.0 spec with:
- meta (validity, lessonScope, etc.)
- distribution (stats, categoryBreakdown)
- diagnostics[] (with locations and suggestions)
- slotAnalysis (slots used/missing, summary)
- score

**Acceptance Criteria:**
- [ ] Matches TypeScript interface in spec
- [ ] All fields populated
- [ ] JSON serializes correctly

---

## Phase 3: Enhanced Features

### Step 3.1: Cloze Blank Detection

**File:** `src/main/java/com/qtihelper/demo/service/ClozeAnalysisService.java`

- Detect blank patterns (＿＿＿, ___, 【　】, etc.)
- Find particle after blank
- Infer expected slot
- Suggest answers based on slot + verb

**Acceptance Criteria:**
- [ ] Detects various blank formats
- [ ] Correctly infers slot from particle
- [ ] Returns suggested answers

### Step 3.2: Primary/Secondary Suggestions

**Modify:** `DiagnosticGeneratorService.java`

Split suggestions into:
- Primary: Same POS
- Secondary: Different POS (with "requires restructure" note)

**Acceptance Criteria:**
- [ ] Suggestions sorted by lesson priority
- [ ] Same POS in primary
- [ ] Different POS in secondary with note

### Step 3.3: Human-Readable Slot Summaries

**Modify:** `DiagnosticGeneratorService.java` or `SlotDetectionService.java`

Add `summary` field to slot analysis:
- Map slots to human terms (SUBJECT→WHO, DIRECTION→WHERE)
- Generate message: "Your worksheet asks WHO (5x) but never WHERE or WHEN"

**Acceptance Criteria:**
- [ ] Summary field populated
- [ ] Human-readable format
- [ ] Lists missing slots

### DEFERRED TO v4.0

The following features are out of scope for v3.0:
- **REARRANGE item handling** - Item type doesn't exist yet
- **Notification watcher system** - Complex frontend state management

---

## Phase 4: UI Integration

### Step 4.1: Unified Language Coach Panel

**File:** `worksheet-ui/src/components/LanguageCoachPanel.tsx`

Replace GrammarCoachPanel with unified panel:
- Three tabs: Distribution, Suggestions, Patterns
- Use existing UI primitives
- No hover effects (1.1.1.1 compliance)

**Acceptance Criteria:**
- [ ] Tabs switch correctly
- [ ] Distribution shows word frequency
- [ ] Suggestions shows diagnostics
- [ ] Patterns shows slot analysis

### Step 4.2: Clickable Locations

**File:** `worksheet-ui/src/components/coach/LocationLink.tsx`

When clicked:
- Scroll to item in worksheet
- Highlight word with pulse animation

**Acceptance Criteria:**
- [ ] Smooth scroll to item
- [ ] Visual highlight appears
- [ ] Works for all item types

### Step 4.3: Diagnostic Card Component

**File:** `worksheet-ui/src/components/coach/DiagnosticCard.tsx`

Display:
- Severity indicator (border color)
- Message
- Locations (clickable)
- Primary/Secondary suggestions
- Dismiss/Ignore buttons

**Acceptance Criteria:**
- [ ] Clear severity visual
- [ ] Expandable locations
- [ ] Top 5 suggestions, expand for more
- [ ] Dismiss and Ignore buttons work

### Step 4.4: Compliance Report UI

For CSV import, show:
- Validation errors (ます形 violations)
- Auto-fix suggestions
- Import valid only option

**Acceptance Criteria:**
- [ ] Blocks invalid imports
- [ ] Shows clear error messages
- [ ] Auto-fix option works

---

## Phase 5: Polish

### Step 5.1: Human-Readable Summaries

Add `summary` field to slot analysis:
- "Your worksheet asks WHO (5x) but never WHERE or WHEN"

### Step 5.2: StyleCoach Removal

Remove `StyleCoachPanel.tsx` and references.

### Step 5.3: Performance Optimization

- Add debounce to analysis trigger
- Cache slot lookups
- Ensure no conflicts with save mechanism

---

## Verification Commands

After each phase:

```bash
# Backend compile
mvn compile

# Full build (backend + frontend)
mvn clean install

# Run app
mvn spring-boot:run

# Frontend only (for UI testing)
cd worksheet-ui && npm run dev
```

---

## Integration Points

### Backend Service Chain
```
GrammarRuleController
  → GrammarAnalysisService (orchestrator)
    → WorksheetScannerService (extract text with locations)
    → SudachiTokenizerService (tokenize)
    → SlotDetectionService (identify slots)
    → DistributionAnalysisService (calculate stats)
    → ValidityCalculationService (determine reliability)
    → DiagnosticGeneratorService (create diagnostics)
    → ClozeAnalysisService (if cloze items exist)
  → Return GrammarCoachResult
```

### Frontend Data Flow
```
LanguageCoachPanel
  → useLanguageCoach hook
    → POST /api/grammar/analyze
    → Receive GrammarCoachResult
  → useNotificationWatcher hook
    → Track dismissed/ignored
    → Re-evaluate on changes
  → Render tabs (Distribution, Suggestions, Patterns)
```

---

## Error Handling

- If no vocab for lesson: Return `validity: "INVALID"` with note
- If unknown words: Flag as `WARNING` type `OUT_OF_SCOPE`
- If Kuromoji fails: Log error, skip that word, continue
- If worksheet empty: Return score 0 with "No content to analyze"

---

## Testing Scenarios

After implementation, verify:

1. **Single lesson analysis** - Only target lesson vocab counts
2. **Range analysis** - All lessons in range, target prioritized
3. **Overuse detection** - Words above threshold flagged
4. **Location tracking** - Clicking jumps to correct item
5. **Cloze detection** - Blanks identified, slot inferred
6. **Rearrange handling** - Vocabulary counted, slots skipped
7. **Notification dismissal** - Hidden but watching
8. **Notification escalation** - Reappears if worse
9. **ます形 enforcement** - Invalid verbs blocked on import
10. **Empty worksheet** - Graceful handling

---

## Final Deliverables

- [ ] All Phase 1-4 complete
- [ ] `mvn clean install` passes
- [ ] Frontend build passes
- [ ] Manual testing of 10 scenarios above
- [ ] Update LANGUAGE_COACH_AUDIT with Stage 1 status

---

## References

- [GRAMMAR_ALGORITHM_SPEC.md](./GRAMMAR_ALGORITHM_SPEC.md) - Full algorithm specification
- [1.1.1.1_RULES.md](./1.1.1.1_RULES.md) - Coding standards
- [GEMINI.md](./GEMINI.md) - Stack configuration
- [LANGUAGE_COACH_AUDIT_stage_0.md](./LANGUAGE_COACH_AUDIT_stage_0.md) - Existing implementation
