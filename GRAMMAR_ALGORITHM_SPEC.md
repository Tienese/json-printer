# Grammar Analysis Algorithm - Technical Specification

> **Version:** 3.0 (LSP-Style Adaptive Analysis)
> **Date:** 2025-12-25
> **Status:** Planning Complete - Ready for Implementation

---

## For Implementers (Opus 4.5)

### Execution Order (Follow This Exactly)

```
PHASE 0A: AUDIT
├── Read: GRAMMAR_COACH_PHASE_0_AUDIT.md
├── Scan entire codebase
├── Document current state
└── Output: Audit Report

PHASE 0B: GAP ANALYSIS
├── Read: GRAMMAR_COACH_GAP_ANALYSIS.md
├── Read: GRAMMAR_ALGORITHM_SPEC.md (this file)
├── Compare spec vs audit
├── Identify gaps
└── Output: Questions for User

PHASE 0C: PRE-IMPLEMENTATION
├── Read: GRAMMAR_COACH_PRE_IMPLEMENTATION.md
├── User answers questions
├── Create seed data files
├── Commit all planning docs
└── Output: Ready for Implementation → PR

PHASES 1-5: IMPLEMENTATION
├── Read: GRAMMAR_COACH_EXECUTION_GUIDE.md
├── Phase 1: Foundation
├── Phase 2: Core Analysis
├── Phase 3: Enhanced Features
├── Phase 4: UI Integration
└── Phase 5: Polish
```

### Document Links

| Order | Document | Purpose |
|-------|----------|---------|
| 1 | [GRAMMAR_COACH_PHASE_0_AUDIT.md](./GRAMMAR_COACH_PHASE_0_AUDIT.md) | Scan codebase, document current state |
| 2 | [GRAMMAR_COACH_GAP_ANALYSIS.md](./GRAMMAR_COACH_GAP_ANALYSIS.md) | Compare spec vs reality, find gaps |
| 3 | [GRAMMAR_COACH_PRE_IMPLEMENTATION.md](./GRAMMAR_COACH_PRE_IMPLEMENTATION.md) | Create seed data, commit docs |
| 4 | [GRAMMAR_COACH_EXECUTION_GUIDE.md](./GRAMMAR_COACH_EXECUTION_GUIDE.md) | Implementation steps |

### Reference Documents

| Document | Purpose |
|----------|---------|
| [1.1.1.1_RULES.md](./1.1.1.1_RULES.md) | Coding standards (CRITICAL) |
| [LANGUAGE_COACH_AUDIT_stage_0.md](./LANGUAGE_COACH_AUDIT_stage_0.md) | Previous audit |
| [CLAUDE.md](./CLAUDE.md) / [GEMINI.md](./GEMINI.md) | Stack configuration |

---

## Table of Contents
1. [Philosophy](#philosophy-grammar-coach-as-lsp)
2. [Architecture Decisions](#architecture-decisions)
3. [SLOT System Design](#slot-system-design)
4. [Tag System Design](#tag-system-design)
5. [Quiz-Specific Parsing](#quiz-specific-parsing)
6. [Algorithm Phases](#algorithm-phases)
7. [API Response Structure](#api-response-structure)
8. [UI Design](#ui-design)
9. [Edge Cases](#edge-case-handling)
10. [Compliance Rules](#compliance-rules)
11. [Risk Assessment](#risk-assessment)
12. [Future Enhancements](#future-enhancements)
13. [Migration Guide](#migration-from-v20)

---

## Philosophy: Grammar Coach as LSP

This algorithm is designed like a **Language Server Protocol** for worksheet creation:
- Provides diagnostics (overuse, underuse, imbalance)
- Suggests vocabulary alternatives
- Shows word locations (like "Go to definition")
- Recommends changes (like code actions)
- **Human decides** - the teacher applies/ignores recommendations

**Not automation. Intelligent recommendations.**

---

## Version History

| Version | Approach | Problem |
|---------|----------|---------|
| v1.0 | Dynamic threshold from data | Threshold moved with overuse |
| v2.0 | Fixed threshold (3 or 15%) | No lesson awareness, no location tracking |
| v3.0 | Adaptive analysis with lesson scope | Current version |

---

## Architecture Decisions

### Confirmed Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Coach UI | Unified with tabs | 1.1.1.1 compliant, single responsibility |
| StyleCoach | Mark for removal | No clear purpose, clean codebase |
| Tag system | Flat with Category + Aspects | Solves multi-classification problem |
| Slot detection | Particle-based | Simple, reliable for N5 |
| ます形 compliance | ENFORCE | Block non-compliant imports |
| Notifications | Smart dismissal | Reappear if worse, "ignore word" option |
| Analysis trigger | Debounced real-time | After meaningful threshold reached |

### UI Structure: Unified Language Coach

```
┌─────────────────────────────────────────────────────────────┐
│  LANGUAGE COACH                                             │
├─────────────────────────────────────────────────────────────┤
│  [Distribution] [Suggestions] [Patterns]  ← Tabs            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Distribution Tab:                                          │
│  └─ Word frequency analysis (from old VocabCoach)           │
│                                                             │
│  Suggestions Tab:                                           │
│  └─ Sentence-aware recommendations with locations           │
│                                                             │
│  Patterns Tab:                                              │
│  └─ Grammar structure coverage (slots used, missing)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## SLOT System Design

### What is a SLOT?

A SLOT is a grammatical position in a Japanese sentence that:
- Accepts specific types of vocabulary (based on tags)
- Is marked by particles (を, に, で, etc.)
- Has semantic constraints based on the verb

### Schema Design

```sql
-- Core slot definitions
CREATE TABLE slot_definition (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,           -- e.g., "OBJECT", "DIRECTION"
    particles TEXT NOT NULL,             -- JSON: ["を"] or ["に", "へ"]
    description VARCHAR(255),            -- Human-readable explanation
    lesson_introduced INT,               -- When this slot is first taught
    UNIQUE(name)
);

-- Default accepted tags per slot (can be overridden by verb)
CREATE TABLE slot_default_tags (
    id BIGINT PRIMARY KEY,
    slot_id BIGINT REFERENCES slot_definition(id),
    tag_name VARCHAR(50) NOT NULL,       -- e.g., "thing", "buyable"
    is_required BOOLEAN DEFAULT false    -- Must have this tag vs. may have
);

-- Verb-specific slot constraints (v4.0 enhancement)
CREATE TABLE verb_slot_constraint (
    id BIGINT PRIMARY KEY,
    verb_base_form VARCHAR(50) NOT NULL, -- e.g., "食べる"
    slot_name VARCHAR(50) NOT NULL,      -- e.g., "OBJECT"
    required_tags TEXT NOT NULL,         -- JSON: ["edible", "food"]
    excluded_tags TEXT,                  -- JSON: ["vehicle", "building"]
    lesson_id INT                        -- When this verb is introduced
);
```

### Slot Definitions for N5

| Slot Name | Particles | Default Tags | Example |
|-----------|-----------|--------------|---------|
| SUBJECT | は, が | person, pronoun | 私**は**、先生**が** |
| OBJECT | を | thing, person | 本**を**、友達**を** |
| LOCATION | で | place | 学校**で**、駅**で** |
| DIRECTION | に, へ | place | 学校**に**、日本**へ** |
| TIME | に | time | 3時**に**、月曜日**に** |
| INSTRUMENT | で | thing, vehicle | バス**で**、ペン**で** |
| COMPANION | と | person | 友達**と** |
| SOURCE | から | place, person | 東京**から**、先生**から** |
| GOAL | まで | place, time | 駅**まで**、5時**まで** |

### Slot Detection Algorithm

```
FUNCTION detectSlots(tokens: List<Token>) -> List<SlotAssignment>:
    assignments = []

    FOR i = 0 TO tokens.length - 1:
        token = tokens[i]

        IF token.pos == "助詞" (particle):
            // Look backwards for the word this particle marks
            IF i > 0:
                markedWord = tokens[i - 1]
                slot = lookupSlotByParticle(token.surface)

                IF slot != null:
                    assignments.add({
                        word: markedWord,
                        slot: slot,
                        particle: token.surface,
                        position: i - 1
                    })

    RETURN assignments
```

### Slot Analysis Output

```typescript
interface SlotAnalysis {
    slotsUsed: Map<SlotName, number>;     // OBJECT: 5, DIRECTION: 2
    slotsMissing: SlotName[];             // Slots with 0 usage
    slotDistribution: SlotDistributionItem[];
    suggestions: SlotSuggestion[];
}

interface SlotDistributionItem {
    slot: string;
    count: number;
    words: string[];
    coverage: number;  // % of available words for this slot used
}

interface SlotSuggestion {
    message: string;  // "Consider adding DIRECTION words"
    slot: string;
    suggestedWords: VocabSuggestion[];
}
```

### Risk Assessment: SLOT System

| Risk | Severity | Mitigation |
|------|----------|------------|
| Parser misidentifies particles | Medium | Log decisions, allow manual override |
| Complexity creep (verb constraints) | High | Strict v3.0 scope, defer verb rules to v4.0 |
| Performance with many checks | Low | Cache slot lookups, batch processing |
| Incomplete N5 coverage | Medium | Start with top 10 patterns, iterate |
| User confusion (grammar terms) | Medium | Use simple language in UI |

---

## Tag System Design

### The Category + Aspects Model

**Problem:** Pure hierarchy fails when items belong to multiple branches.
- 車 (car) is a thing, a vehicle, buyable, and giftable
- Hierarchy forces single parent, but car has multiple classifications

**Solution:** Two-level flat system with Category (what it IS) and Aspects (what it CAN DO).

### Schema Design

```sql
-- Vocabulary with category and aspects
CREATE TABLE vocab (
    id BIGINT PRIMARY KEY,
    lesson_id INT NOT NULL,
    display_form VARCHAR(100) NOT NULL,  -- Original form from CSV
    base_form VARCHAR(100) NOT NULL,     -- Kuromoji-normalized
    part_of_speech VARCHAR(50),          -- From Kuromoji
    category VARCHAR(50) NOT NULL,       -- person, thing, place, time, action, descriptor
    aspects TEXT                         -- JSON array: ["buyable", "vehicle", "expensive"]
);

-- Aspect definitions for reference/validation
CREATE TABLE aspect_definition (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,    -- e.g., "buyable"
    description VARCHAR(255),            -- "Can be purchased"
    applicable_categories TEXT           -- JSON: ["thing", "place"] - which categories can have this
);
```

### Categories (Mutually Exclusive)

| Category | Description | Examples |
|----------|-------------|----------|
| person | Human beings, roles | 私, 先生, 学生, 友達 |
| thing | Physical objects | 本, 車, ペン, 電話 |
| place | Locations | 学校, 駅, 日本, 部屋 |
| time | Time expressions | 今日, 明日, 3時, 月曜日 |
| action | Verbs (ます form) | 食べます, 行きます, 買います |
| descriptor | Adjectives | 高い, きれい, 好き |

### Aspects (Combinable)

**Capability Aspects:**
- buyable, giftable, edible, drinkable, wearable, readable, usable

**Type Aspects:**
- vehicle, tool, container, furniture, electronics, food, drink, clothing

**Context Aspects:**
- school_related, work_related, home_related, travel_related

**Property Aspects:**
- expensive, cheap, large, small, animate, inanimate

### Query Examples

```sql
-- What can I buy?
SELECT * FROM vocab WHERE aspects @> '["buyable"]';

-- What vehicles exist in Lesson 5?
SELECT * FROM vocab
WHERE lesson_id = 5 AND aspects @> '["vehicle"]';

-- What school-related things can I buy?
SELECT * FROM vocab
WHERE category = 'thing'
  AND aspects @> '["school_related", "buyable"]';
```

### Contextual Narrowing Algorithm

```
FUNCTION suggestForSlot(
    slot: SlotName,
    verb: String,
    contextWords: List<String>,
    lessonRange: Range
) -> List<VocabSuggestion>:

    // Step 1: Get base candidates from slot's default tags
    candidates = getVocabBySlotTags(slot, lessonRange)

    // Step 2: Apply verb-specific constraints (if defined)
    IF hasVerbConstraint(verb, slot):
        constraint = getVerbConstraint(verb, slot)
        candidates = filterByTags(candidates, constraint.requiredTags)
        candidates = excludeByTags(candidates, constraint.excludedTags)

    // Step 3: Apply contextual narrowing
    FOR contextWord IN contextWords:
        wordAspects = getAspects(contextWord)

        // If context contains "学校", boost school_related words
        IF "school_related" IN wordAspects:
            candidates = boostByAspect(candidates, "school_related")

        // If context contains "食べます", require edible
        IF isEatingVerb(contextWord):
            candidates = filterByAspect(candidates, "edible")

    // Step 4: Sort by lesson priority and current usage
    candidates = sortByPriority(candidates, targetLesson)

    RETURN top(candidates, 10)
```

---

## Quiz-Specific Parsing

### Item Type Detection

| Item Type | Structure | Parsing Mode |
|-----------|-----------|--------------|
| VOCAB | `{ term, meaning }` | SIMPLE - extract term only |
| GRID | `{ content }` or boxes | SIMPLE - extract content string |
| MULTIPLE_CHOICE | `{ prompt, options[] }` | STRUCTURED - parse each option |
| MATCHING | `{ pairs[] }` | STRUCTURED - parse match values |
| CLOZE | `{ passage }` | SPECIAL - detect blanks |
| REARRANGE | `{ fragments[] }` | VOCABULARY_ONLY - no structure |
| TRUE_FALSE | `{ statement }` | SKIP - prompts only |

### Rearrange Question Handling

```
Input: [は・あげました・に・わたし・を・鈴木さん・車・]

PARSING MODE: VOCABULARY_ONLY

Analysis:
├─ Tokens extracted: [は, あげました, に, わたし, を, 鈴木さん, 車]
├─ Particles found: [は, に, を]
├─ Content words: [わたし, 鈴木さん, 車, あげました]
├─ Structure: CANNOT_DETERMINE (scrambled)
└─ Note: "Rearrange question - vocabulary analyzed, structure skipped"

Output:
├─ Word frequency counted ✓
├─ Vocabulary coverage checked ✓
├─ Slot analysis: SKIPPED
└─ Grammar pattern: SKIPPED
```

### Cloze Question Handling

```
Input: わたしは＿＿＿をたべます

PARSING MODE: CLOZE_AWARE

Step 1: Detect blank
├─ Blank patterns: ＿＿＿, ___, 【　】, (   ), ___
├─ Found: ＿＿＿ at position 4

Step 2: Analyze surrounding context
├─ Before blank: わたしは
├─ After blank: をたべます
├─ Particle after blank: を
├─ Verb: 食べます (to eat)

Step 3: Infer expected slot
├─ Particle を → OBJECT slot
├─ Verb 食べる → requires [edible, food]
├─ Expected answer tags: [edible, food, thing]

Step 4: Generate suggestions
├─ From lesson vocab with [edible] aspect:
│   ├─ ごはん (rice)
│   ├─ パン (bread)
│   ├─ りんご (apple)
│   └─ さかな (fish)
└─ Can validate if answer key matches expected slot ✓
```

### Blank Detection Regex

```java
// Patterns to detect blanks in cloze questions
private static final Pattern BLANK_PATTERNS = Pattern.compile(
    "＿{2,}|_{2,}|【\\s*】|（\\s*）|\\(\\s*\\)|\\[\\s*\\]"
);

// Extract context around blank
public BlankContext analyzeBlank(String passage) {
    Matcher m = BLANK_PATTERNS.matcher(passage);
    if (m.find()) {
        int blankStart = m.start();
        int blankEnd = m.end();

        String before = passage.substring(0, blankStart);
        String after = passage.substring(blankEnd);

        // Find particle immediately after blank
        String particleAfter = extractFirstParticle(after);

        return new BlankContext(blankStart, particleAfter, before, after);
    }
    return null;
}
```

---

## Compliance Rules

### ます形 Enforcement

**Policy:** ENFORCE - Block non-compliant imports with clear error message.

```
CSV Import Validation:

VALID:
├─ 食べます ✓ (ます form)
├─ 行きます ✓ (ます form)
├─ 高い ✓ (い-adjective, no change needed)
├─ きれい ✓ (な-adjective, な removed)
└─ 静か ✓ (な-adjective, な removed)

INVALID:
├─ 食べる ✗ → ERROR: "Dictionary form detected. Expected: 食べます"
├─ 食べて ✗ → ERROR: "て-form detected. Expected: 食べます"
├─ きれいな ✗ → ERROR: "な-adjective should not include な. Expected: きれい"
└─ 行った ✗ → ERROR: "Past tense detected. Expected: 行きます"
```

### Compliance Check Algorithm

```java
public ValidationResult validateVocabEntry(String word, String pos) {
    // Check verb forms
    if (pos.startsWith("動詞")) {
        if (!word.endsWith("ます")) {
            String suggestion = convertToMasuForm(word);
            return ValidationResult.error(
                "Verb must be in ます form. Found: " + word +
                ". Expected: " + suggestion
            );
        }
    }

    // Check な-adjective
    if (pos.contains("形容動詞") && word.endsWith("な")) {
        String corrected = word.substring(0, word.length() - 1);
        return ValidationResult.error(
            "な-adjective should not include な. Found: " + word +
            ". Expected: " + corrected
        );
    }

    return ValidationResult.valid();
}
```

### Compliance Report UI

```
┌─────────────────────────────────────────────────────────────┐
│  IMPORT COMPLIANCE REPORT                                   │
├─────────────────────────────────────────────────────────────┤
│  File: lesson5_vocab.csv                                    │
│  Total entries: 45                                          │
│  Valid: 42                                                  │
│  Errors: 3                                                  │
├─────────────────────────────────────────────────────────────┤
│  🔴 Line 12: 食べる                                          │
│     Error: Dictionary form detected                         │
│     Expected: 食べます                                       │
│     [Auto-fix] [Skip] [Edit manually]                       │
│                                                             │
│  🔴 Line 28: きれいな                                        │
│     Error: な-adjective should not include な               │
│     Expected: きれい                                         │
│     [Auto-fix] [Skip] [Edit manually]                       │
│                                                             │
│  🔴 Line 33: 行った                                          │
│     Error: Past tense detected                              │
│     Expected: 行きます                                       │
│     [Auto-fix] [Skip] [Edit manually]                       │
├─────────────────────────────────────────────────────────────┤
│  [Fix All] [Import Valid Only] [Cancel]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Notification Watcher System

### Behavior Specification

```
NOTIFICATION LIFECYCLE:

1. CREATED
   └─ Diagnostic detected, notification appears in sidebar

2. WATCHING
   └─ System observes the flagged item for changes

3. RESOLVED (auto)
   └─ User fixes the issue → notification self-removes

4. ESCALATED
   └─ Issue gets worse → severity increases, reappears if dismissed

5. DISMISSED (manual)
   └─ User clicks dismiss → hidden but still watching

6. IGNORED (permanent)
   └─ User clicks "Don't show for this word" → never show again for this word
```

### Watcher Logic

```typescript
interface NotificationWatcher {
    id: string;
    targetItemIndex: number;
    targetWord: string;
    originalSeverity: Severity;
    currentSeverity: Severity;
    status: 'active' | 'dismissed' | 'ignored' | 'resolved';
    threshold: number;  // At time of creation
    currentCount: number;
}

function evaluateWatcher(watcher: NotificationWatcher, newAnalysis: AnalysisResult): WatcherAction {
    const newCount = newAnalysis.wordCounts[watcher.targetWord] || 0;
    const newThreshold = newAnalysis.distribution.overuseThreshold;

    // Check if resolved
    if (newCount <= newThreshold) {
        return { action: 'RESOLVE', reason: 'Issue fixed' };
    }

    // Check if escalated
    if (newCount > watcher.currentCount) {
        if (watcher.status === 'dismissed') {
            return { action: 'REAPPEAR', reason: 'Issue worsened' };
        }
        return { action: 'ESCALATE', newSeverity: calculateSeverity(newCount, newThreshold) };
    }

    // Check if threshold changed (worksheet grew)
    if (newThreshold > watcher.threshold) {
        const newSeverity = calculateSeverity(newCount, newThreshold);
        if (newSeverity < watcher.currentSeverity) {
            return { action: 'DOWNGRADE', newSeverity };
        }
    }

    return { action: 'NO_CHANGE' };
}
```

### UI Notification Component

```
┌─────────────────────────────────────────────────────────────┐
│  🔴 学生 overused (12x, threshold: 4)                        │
├─────────────────────────────────────────────────────────────┤
│  Locations: Item 2, Item 5, Item 7, +9 more                 │
│                                                             │
│  Suggestions:                                               │
│  └─ 生徒 (0 uses), 先生 (1 use), 人 (0 uses)                │
│                                                             │
│  [Dismiss] [Ignore "学生" permanently]                       │
└─────────────────────────────────────────────────────────────┘

After user clicks [Dismiss]:
┌─────────────────────────────────────────────────────────────┐
│  (Watching: 学生 - will reappear if count increases)        │
└─────────────────────────────────────────────────────────────┘

If count increases from 12 to 15:
┌─────────────────────────────────────────────────────────────┐
│  🔴 学生 overused (15x ↑3, threshold: 4)                     │
│  ⚠️ Issue worsened since dismissal                          │
├─────────────────────────────────────────────────────────────┤
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk Assessment

### Implementation Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Kuromoji parser edge cases | Medium | Medium | Extensive testing with real Minna no Nihongo content |
| Slot detection accuracy | Medium | Low | Particle-based detection is reliable; log ambiguous cases |
| Performance with real-time analysis | Low | Low | Debounce, batch processing, max 10 pages |
| Complexity creep | High | Medium | Strict v3.0 scope boundary; defer verb constraints |
| Tag maintenance burden | Medium | Medium | Start with minimal aspects, add as needed |
| UI confusion | Medium | Medium | Simple language, tooltips, progressive disclosure |

### Scope Boundaries

**IN SCOPE for v3.0:**
- Particle-based slot detection (default mappings: で→LOCATION, に→DIRECTION)
- Category + Aspects tag system
- Cloze blank analysis
- Unified Language Coach UI (tabs: Distribution, Suggestions, Patterns)
- ます形 enforcement
- Lesson scope filtering (with fallback to all lessons)
- Location tracking for diagnostics
- Score calculation with weighted formula

**OUT OF SCOPE (v4.0+):**
- REARRANGE item type handling
- Notification watcher system
- Verb-specific slot constraints
- Semantic similarity suggestions
- Grammar point tracking entity
- Adjective metadata (い vs な, emotion patterns)
- Valency-aware analysis
- が particle disambiguation (subject vs object of emotion)
- Full particle disambiguation (で, に context-aware)

---

## Algorithm Phases

### Phase 1: Pool Analysis

Load vocabulary for the specified lesson range and calculate pool metrics.

```
INPUT:
├─ lesson_scope: { mode: "single" | "range", target: number, range?: [start, end] }
└─ vocab_database: all vocabulary entries

OUTPUT:
├─ pool_size: total words in scope
├─ pool_by_category: Map<VocabTag, Word[]>
├─ pool_by_pos: Map<PartOfSpeech, Word[]>
├─ pool_by_lesson: Map<LessonId, Word[]>
└─ lesson_priorities: Map<LessonId, "HIGH" | "LOW">
```

**Lesson Priority Rules:**
- Target lesson = HIGH priority
- All other lessons in range = LOW priority (ordered by recency: 4 → 3 → 2 → 1)

### Phase 2: Worksheet Analysis

Extract and tokenize Japanese content, tracking exact locations.

```
INPUT:
├─ worksheet_json: raw worksheet content
└─ tokenizer: Kuromoji (via SudachiTokenizerService)

OUTPUT:
├─ word_occurrences: Map<BaseForm, WordOccurrence>
│   └─ WordOccurrence: { count, locations[], category, pos, lesson }
└─ sentence_boundaries: detected via 。delimiter
```

**Location Tracking:**
```typescript
interface WordLocation {
  itemIndex: number;        // Which item in worksheet
  itemType: string;         // GRID, VOCAB, MULTIPLE_CHOICE, etc.
  sentenceIndex?: number;   // Which sentence within item
  charStart?: number;       // Character position for highlighting
  charEnd?: number;
  preview: string;          // Context snippet (e.g., "...私は学生です...")
}
```

### Phase 3: Validity Calculation

Determine statistical reliability based on lesson content, not fixed numbers.

```
METRICS:
├─ overall_coverage = unique_words_used / pool_size
├─ category_coverage[] = for each VocabTag:
│     words_used_with_tag / words_in_pool_with_tag
├─ min_category_coverage = min(category_coverage[])
├─ categories_touched = count(coverage > 0)
└─ total_categories = count(distinct tags in pool)

VALIDITY RULES:
├─ HIGH:   overall >= 60% AND min_category >= 30% AND categories_touched >= 80%
├─ MEDIUM: overall >= 30% AND categories_touched >= 60%
└─ LOW:    everything else

OUTPUT:
├─ validity: "HIGH" | "MEDIUM" | "LOW"
└─ validity_note: contextual explanation
```

**Example Validity Notes:**
```
LOW: "Worksheet covers 15% of vocabulary. Missing categories: places, animals.
     Statistics are indicative only."

MEDIUM: "Good category spread (83%). Places underrepresented (25%).
        Consider adding 学校, 駅, or 病院."

HIGH: "Excellent coverage (72%) across all categories.
      Distribution statistics are highly reliable."
```

### Phase 4: Distribution Analysis

Calculate expected distribution and identify outliers.

```
METRICS:
├─ total_word_count = sum of all occurrences (with repetition)
├─ unique_word_count = distinct words used
├─ expected_per_word = total_word_count / unique_word_count
├─ std_deviation = stddev(word_counts)
├─ overuse_threshold = expected + (2 × std_deviation)
└─ underuse_threshold = 0 (or < expected - std_deviation)

CATEGORY-LEVEL ANALYSIS:
For each VocabTag category:
├─ category_pool_size = words in pool with this tag
├─ category_used = words in worksheet with this tag
├─ category_coverage = category_used / category_pool_size
└─ Flag if category_coverage < 30% but other categories > 60%
```

### Phase 5: Suggestion Generation

Generate replacement suggestions with priority ordering.

```
FOR OVERUSED WORDS:
├─ Find alternatives from same category (VocabTag)
├─ Sort by:
│   1. Lesson priority (HIGH before LOW)
│   2. Current usage (0 uses first)
│   3. POS match (same POS first)
├─ PRIMARY suggestions: same POS
├─ SECONDARY suggestions: different POS (requires sentence restructure)
└─ Limit: Top 5 shown, expandable to all

FOR UNDERUSED WORDS:
├─ Identify words with 0 uses from target lesson
├─ Group by category
└─ Recommend for inclusion
```

**Suggestion Structure:**
```typescript
interface ReplacementSuggestion {
  word: string;
  currentUsage: number;
  lesson: number;
  lessonPriority: "HIGH" | "LOW";
  pos: string;
  isSamePOS: boolean;
  category: string;
}
```

### Phase 6: Diagnostic Generation

Generate LSP-style diagnostics with severity levels.

```
SEVERITY LEVELS:
├─ ERROR (red):   Critical imbalance - word used 3σ+ above expected
├─ WARNING (yellow): Notable overuse - word used 2σ above expected
├─ INFO (blue):   Suggestion - underused words available
└─ HINT (gray):   Context - validity notes, missing categories

EACH DIAGNOSTIC INCLUDES:
├─ severity
├─ message
├─ targetWord (if applicable)
├─ actualCount vs expectedCount
├─ locations[] (clickable)
├─ suggestions[] (primary + secondary)
└─ category context
```

---

## API Response Structure

```typescript
interface GrammarCoachAnalysisResult {
  // Metadata
  meta: {
    worksheetWordCount: number;      // Total with repetition
    uniqueWordsUsed: number;         // Distinct words
    vocabPoolSize: number;           // Available in lesson scope
    lessonScope: {
      mode: "single" | "range";
      target: number;
      range?: [number, number];
    };
    validity: "HIGH" | "MEDIUM" | "LOW";
    validityNote: string;
  };

  // Distribution overview
  distribution: {
    expectedPerWord: number;
    stdDeviation: number;
    overuseThreshold: number;
    categoryBreakdown: Array<{
      category: string;
      poolSize: number;
      used: number;
      coverage: number;  // percentage
    }>;
  };

  // LSP-style diagnostics
  diagnostics: Array<{
    severity: "ERROR" | "WARNING" | "INFO" | "HINT";
    type: "OVERUSE" | "UNDERUSE" | "CATEGORY_IMBALANCE" | "VALIDITY_NOTE";
    message: string;
    word?: string;
    actualCount?: number;
    expectedCount?: number;
    locations?: WordLocation[];
    suggestions?: {
      primary: ReplacementSuggestion[];    // Same POS
      secondary: ReplacementSuggestion[];  // Different POS
    };
  }>;

  // Slot analysis (grammar structure)
  slotAnalysis: {
    slotsUsed: Record<string, number>;  // { "OBJECT": 5, "DIRECTION": 2 }
    slotsMissing: string[];             // ["TIME", "COMPANION"]
    slotDistribution: Array<{
      slot: string;
      count: number;
      words: string[];
      coverage: number;
    }>;
    suggestions: Array<{
      message: string;
      slot: string;
      suggestedWords: string[];
    }>;
    // Human-readable summary
    summary: string;  // "Your worksheet asks WHO (5x) and WHAT (3x) but never asks WHERE or WHEN."
  };

  // Cloze analysis (if applicable)
  clozeAnalysis?: Array<{
    itemIndex: number;
    blankPosition: number;
    inferredSlot: string;
    expectedTags: string[];
    suggestedAnswers: string[];
  }>;

  // Summary score
  score: {
    value: number;           // 0-100
    interpretation: string;  // "Well balanced" | "Needs attention" | etc.
  };
}
```

---

## Filtering Rules (Unchanged from v2.0)

### What Gets Counted
- Japanese text only (Hiragana, Katakana, Kanji regex)
- Words that exist in vocab database for the lesson scope
- Inner item content only:
  - VOCAB: `term` field
  - GRID: `box.value` fields
  - MULTIPLE_CHOICE: `option.text` fields
  - MATCHING: `match` field
  - CLOZE: `passage` field
  - CARD: `content` field

### What Gets Ignored
- Prompts (Vietnamese/English)
- Meanings (Vietnamese translations)
- Headers and metadata
- TRUE_FALSE items (prompts only)
- Non-Japanese text

---

## Frontend Integration

### Clickable Locations
Each diagnostic's locations are clickable:
1. User clicks location in panel
2. Worksheet scrolls to that item
3. Word is highlighted with pulse animation

```typescript
function scrollToItem(itemIndex: number, word: string) {
  const element = document.querySelector(`[data-item-index="${itemIndex}"]`);
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightWord(element, word);
}
```

### Suggestion Display
```
┌─────────────────────────────────────────────────────────────┐
│  🔴 ERROR: 学生 overused (12x, expected ~4x)                 │
├─────────────────────────────────────────────────────────────┤
│  Locations (click to jump):                                 │
│  ├─ [Item 2: GRID] 学生の名前は...                          │
│  ├─ [Item 5: VOCAB] 学生                                    │
│  └─ ... 10 more                                             │
│                                                             │
│  PRIMARY (same POS: 名詞):                                   │
│  ├─ 生徒 (0 uses, L5) ★ HIGH priority                       │
│  ├─ 先生 (1 use, L5) ★ HIGH priority                        │
│  └─ 人 (0 uses, L4)                                         │
│                                                             │
│  SECONDARY (different POS):                                 │
│  └─ 勉強する (0 uses, L5, 動詞) - requires restructure      │
│                                                             │
│  [▼ Show 12 more alternatives...]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Case Handling

### No Vocabulary for Target Lesson
Return structured response with `validity: "INVALID"` and descriptive note.
UI should display: "No vocabulary found for Lesson X. Import lesson data first."

### Unknown Words (Out of Scope)
Flag as `WARNING` with type `OUT_OF_SCOPE`.
Message: "Word not in lesson vocabulary. May be out of scope or needs database update."
Include locations so user can review.

### All Words Used Exactly Once
Context-dependent response based on coverage:

```
IF coverage >= 70%:
  → INFO: "Excellent variety! Each word appears once.
           Good for exposure. Consider repetition if drilling needed."

ELIF coverage >= 40%:
  → INFO: "Good variety. Each word unique.
           Consider adding more words for comprehensive coverage."

ELSE:
  → HINT: "Limited sample. Each word appears once.
           Expand worksheet for meaningful distribution analysis."
```

### Kuromoji Edge Cases
| Case | Handling |
|------|----------|
| Unknown words | Flag as UNRECOGNIZED, skip from analysis |
| Compound splitting | Check vocab DB first for compound match |
| Particle attachment | Post-process to strip common particles |
| Katakana loanwords | Accept surface form as base form |

---

## Score Calculation (Option A: Weighted Formula)

```
score = 100
      - (errors × 15)
      - (warnings × 5)
      - (imbalanced_categories × 10)
      - (validity_penalty)  // LOW: -10, MEDIUM: -5

score = max(0, score)
```

**Interpretation:**
| Score | Label | Meaning |
|-------|-------|---------|
| 90-100 | Excellent | Well-balanced, comprehensive |
| 70-89 | Good | Minor issues, generally solid |
| 50-69 | Needs Work | Notable imbalances to address |
| 0-49 | Review Required | Significant distribution problems |

---

## Auto-Tagging Vision (Future Enhancement)

### Phase 1: Pattern-Based Heuristics
```
IF word ends with 人/者/員/家 → suggest "person"
IF word ends with 店/屋/館/所 → suggest "place"
IF word ends with 物/品/具 → suggest "thing"
IF POS = 動詞-自立 → suggest "action"
IF POS = 形容詞 → suggest "descriptor"
```

### Phase 2: Co-occurrence Learning
Track tag patterns within lessons. Suggest tags based on:
- POS similarity
- Lesson context
- Co-occurring words

### Key Principle
Never auto-apply. Always **suggest** and let human confirm.

---

## Future Enhancements

### Grammar Point Tracking (Not Yet Implemented)
```
GrammarPoint entity:
├─ lessonId
├─ name: "negative form"
├─ pattern: "〜ません" or "〜ない"
├─ category: VERB_CONJUGATION | PARTICLE | SENTENCE_END

Analysis would include:
├─ "Worksheet uses positive forms 15x, negative 2x"
├─ "Question pattern (か) not used - consider adding"
└─ Grammar coverage affects validity calculation
```

### Semantic Similarity
- Suggest synonyms based on meaning, not just category
- Requires additional data source or embedding model

### Valency and Word Metadata (v4.0 Vision)

**The Problem:** Some words have special grammatical requirements.

**Adjective Types in Japanese:**

| Type | Modification | Predicate | Example |
|------|--------------|-----------|---------|
| い-adjective | 高い + noun | 高いです | 高いひと (tall person) |
| な-adjective | 好き**な** + noun | 好きです | 好きなひと (liked person) |

Both 高いひと and 好きなひと are grammatically complete. The difference is:
1. **Conjugation pattern** (い vs な)
2. **Semantic role** (state description vs preference/emotion)

**The が Particle Ambiguity:**

が can mark different roles depending on predicate type:

```
SUBJECT marker (with action/state verbs):
  先生が来ます = The teacher comes (先生 = subject)
  本が高いです = The book is expensive (本 = subject)

OBJECT marker (with emotion/ability predicates):
  ケーキが好きです = (I) like cake (ケーキ = object of liking)
  日本語がわかります = (I) understand Japanese (日本語 = object)
  ピアノができます = (I) can play piano (ピアノ = object of ability)
```

**Proposed Metadata for v4.0:**

```typescript
interface WordMetadata {
  // Current (v3.0)
  category: Category;
  aspects: string[];
  lessonId: number;

  // Future (v4.0)
  adjectiveType?: 'い' | 'な';
  predicateType?: 'state' | 'action' | 'emotion' | 'ability';
  gaParticleRole?: 'subject' | 'object';  // What が means with this word
  requiredSlots?: string[];  // For ditransitive verbs like あげます
}
```

**Emotion/Ability Predicates (が = object):**
- 好き、嫌い、上手、下手、得意、苦手 (preferences/skills)
- わかる、できる、見える、聞こえる (abilities/perceptions)
- ほしい、〜たい (desires)

**For v3.0:** We note this complexity exists but treat が uniformly. Full disambiguation requires predicate-aware analysis in v4.0.

### Human-Readable Slot Summaries

Instead of raw slot counts, provide natural language feedback:

```
Raw data:
  SUBJECT: 5, OBJECT: 3, DIRECTION: 0, TIME: 0, LOCATION: 2

Human-readable:
  "Your worksheet asks WHO (5x) and WHAT (3x) but never asks
   WHERE someone is going or WHEN something happens.
   Consider adding direction or time expressions."
```

**Mapping:**
| Slot | Human Term | Question Word |
|------|------------|---------------|
| SUBJECT | WHO | だれ |
| OBJECT | WHAT | なに |
| DIRECTION | WHERE (to) | どこへ |
| LOCATION | WHERE (at) | どこで |
| TIME | WHEN | いつ |
| INSTRUMENT | HOW / WITH WHAT | なにで |
| COMPANION | WITH WHOM | だれと |
| SOURCE | FROM WHERE | どこから |

---

## Implementation Priority

### Phase 1: Foundation (Must Have)
1. **Update Vocab schema** - Add `category` and `aspects` columns
2. **Create SlotDefinition table** - Store N5 slot definitions
3. **Update WorksheetScannerService** - Return locations with extracted text
4. **Particle detection** - Identify slots from particles
5. **Lesson scope filtering** - Filter vocab by lesson range

### Phase 2: Core Analysis (Must Have)
1. **Distribution analysis** - Word frequency with dynamic thresholds
2. **Category coverage** - Track usage by category/aspects
3. **Validity calculation** - Dynamic validity based on coverage
4. **Diagnostic generation** - ERROR/WARNING/INFO/HINT with locations
5. **Score calculation** - Weighted formula

### Phase 3: Enhanced Features (Should Have)
1. **Cloze blank detection** - Infer expected slot from context
2. **Rearrange handling** - Vocabulary-only mode
3. **Primary/Secondary suggestions** - Same POS vs different POS
4. **Notification watcher** - Smart dismissal with escalation

### Phase 4: UI Integration (Should Have)
1. **Unified Language Coach panel** - Three tabs (Distribution, Suggestions, Patterns)
2. **Clickable locations** - Scroll to item and highlight
3. **Suggestion display** - Show top 5 with expand
4. **Compliance report** - ます形 enforcement UI

### Phase 5: Polish (Nice to Have)
1. **Auto-tagging suggestions** - Pattern-based hints
2. **Contextual narrowing** - Boost relevant aspects based on context
3. **StyleCoach removal** - Clean up deprecated code
4. **Performance optimization** - Caching, debounce tuning
5. **Human-readable summaries** - "Your worksheet asks WHO (5x) but never WHERE"

### Estimated Complexity

| Component | Complexity | Dependencies |
|-----------|------------|--------------|
| Vocab schema update | Low | None |
| Slot definitions | Low | Vocab schema |
| Scanner with locations | Medium | None |
| Particle detection | Medium | Scanner |
| Distribution analysis | Medium | Scanner, Vocab |
| Validity calculation | Low | Distribution |
| Diagnostic generation | Medium | All analysis |
| Cloze detection | Medium | Particle detection |
| Notification watcher | High | Frontend state management |
| Unified UI | Medium | API complete |

---

## Migration from v2.0

### Breaking Changes
- Response structure completely redesigned
- `threshold` field removed (now calculated dynamically)
- `violations` renamed to `diagnostics` with richer structure

### New Required Parameters
- `lessonScope` must be provided for analysis
- Frontend must handle new diagnostic structure

### Backward Compatibility
- v2.0 endpoint can be maintained separately if needed
- Or provide adapter layer to transform v3.0 response to v2.0 format
