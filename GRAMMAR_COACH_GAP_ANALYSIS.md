# Grammar Coach v3.0 - Phase 0B: Gap Analysis

> **Purpose:** Compare spec requirements against audit findings to identify gaps.
> **Executor:** Opus 4.5
> **Status:** COMPLETE - All questions answered
> **Next Step:** Proceed to [GRAMMAR_COACH_PRE_IMPLEMENTATION.md](./GRAMMAR_COACH_PRE_IMPLEMENTATION.md)

---

## User Answers Summary (2025-12-25)

| Question | Answer |
|----------|--------|
| REARRANGE item type | DEFERRED to v4.0 |
| Particle disambiguation | Default: で→LOCATION, に→DIRECTION |
| Backward compatibility | Replace v2.0 entirely |
| Lesson scope default | Fallback to all lessons with HINT |
| StyleCoachPanel | DELETE in Phase 5 |
| Notification watcher | DEFERRED to v4.0 |
| Field name mismatches | TypeScript is source of truth, fix Scanner |

**All critical gaps addressed. Ready for pre-implementation.**

---

## Prerequisite Check

Before starting this document:

- [ ] **PHASE 0A COMPLETE:** Audit report produced from GRAMMAR_COACH_PHASE_0_AUDIT.md
- [ ] **SPEC READ:** GRAMMAR_ALGORITHM_SPEC.md read completely

**If audit not complete, STOP and complete it first.**

---

## Instructions for Opus 4.5

1. Read each question carefully
2. Search the codebase for relevant existing code
3. Search the spec documents for coverage
4. Mark the status and add notes
5. At the end, list ALL gaps that need clarification

---

## Section 1: Existing Code Understanding

### 1.1 Current Services

| Question | Status | Notes |
|----------|--------|-------|
| What does `GrammarAnalysisService.analyze()` currently return? | | |
| What methods does `WorksheetScannerService` have? | | |
| How does `SudachiTokenizerService.tokenizeWithPos()` work? | | |
| What is the current `GrammarAnalysisResult` DTO structure? | | |
| How does `VocabSeederService` import CSV data? | | |
| What does `GrammarRuleService.getEnabledRules()` return? | | |

### 1.2 Current Entities

| Question | Status | Notes |
|----------|--------|-------|
| What fields does `Vocab` entity currently have? | | |
| What fields does `VocabTag` entity have? | | |
| How does `VocabTagMapping` link vocab to tags? | | |
| What is the structure of `GrammarRule` entity? | | |
| What is the structure of `RuleSuggestion` entity? | | |

### 1.3 Current Frontend

| Question | Status | Notes |
|----------|--------|-------|
| How does `GrammarCoachPanel.tsx` fetch analysis data? | | |
| How does `CoachSidebar.tsx` organize the panels? | | |
| Does `VocabCoachPanel.tsx` exist? What does it do? | | |
| Does `StyleCoachPanel.tsx` exist? What does it do? | | |
| How are worksheet items rendered in the main editor? | | |
| What is the worksheet state structure in React? | | |

---

## Section 2: Worksheet Item Types

### 2.1 Item Type Extraction

For EACH item type, answer:

**VOCAB Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of a VOCAB item? | | |
| Which fields should be extracted for analysis? | | |
| Which fields should be IGNORED? | | |
| How is `term` vs `meaning` distinguished? | | |
| Can VOCAB items have multiple terms? Structure? | | |

**GRID Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of a GRID item? | | |
| Is content a single string or array of boxes? | | |
| How are `sections` and `boxes` organized? | | |
| What is extracted: `content` or `boxes[].value`? | | |
| Are there guide lines or metadata to ignore? | | |

**MULTIPLE_CHOICE Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| What is a `prompt` vs `options`? | | |
| Should prompts be analyzed or ignored? | | |
| How are options structured (array of strings or objects)? | | |
| Is there a correct answer marker? Should it be treated differently? | | |

**MATCHING Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of pairs? | | |
| What is `match` vs `prompt` in a pair? | | |
| Should both sides be analyzed or just one? | | |
| How many pairs typically exist? | | |

**CLOZE Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| Is `passage` a single string or structured? | | |
| What blank patterns are used? (＿＿＿, ___, 【】, etc.) | | |
| Is there an `answers` field with correct answers? | | |
| Should we analyze the passage WITH blanks or substitute answers? | | |

**REARRANGE Item** ⚠️ NEEDS CLARIFICATION
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of a REARRANGE item? | | |
| Is it called "REARRANGE" or something else in code? | | |
| Are fragments stored as array of strings? | | |
| Is the correct order stored somewhere? | | |
| How do we detect this is a rearrange vs other types? | | |
| What EXACTLY should be extracted? | | |
| Why can't we do slot analysis on rearranged content? | | |

**TRUE_FALSE Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| Why is this skipped entirely in analysis? | | |
| Is the statement in Japanese or Vietnamese? | | |

**CARD Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| What is `content` field? Single string? | | |
| What is a CARD used for in worksheets? | | |

**HEADER Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| Why is this ignored in analysis? | | |

**TEXT Item**
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | | |
| Is this for instructions/prompts? | | |
| Why is this ignored in analysis? | | |

---

## Section 3: Slot Detection Details

### 3.1 Particle Disambiguation

| Question | Status | Notes |
|----------|--------|-------|
| で can be LOCATION or INSTRUMENT - how to distinguish? | | |
| に can be DIRECTION or TIME - how to distinguish? | | |
| が can be SUBJECT or OBJECT (with emotion verbs) - documented? | | |
| What happens if particle is ambiguous? | | |
| Should we track ambiguity in the response? | | |

### 3.2 Slot Detection Algorithm

| Question | Status | Notes |
|----------|--------|-------|
| What if a word has NO particle (sentence-final verb)? | | |
| What if particle is attached to the word by Kuromoji? | | |
| How to handle compound particles (には, では, からも)? | | |
| What slot does the verb itself belong to? | | |
| How to handle copula (です, だ)? | | |

### 3.3 Edge Cases

| Question | Status | Notes |
|----------|--------|-------|
| What if sentence has no verb? | | |
| What if sentence is incomplete/fragment? | | |
| What about questions (か particle)? | | |
| What about quotations (と particle for quoting)? | | |

---

## Section 4: Distribution Analysis Details

### 4.1 Threshold Calculation

| Question | Status | Notes |
|----------|--------|-------|
| How exactly is `expected_per_word` calculated? | | |
| How is standard deviation calculated? | | |
| What is the formula for overuse threshold? | | |
| What is the formula for underuse threshold? | | |
| What if there's only 1 unique word? (division by zero?) | | |
| What if all words appear exactly once? | | |

### 4.2 Category Analysis

| Question | Status | Notes |
|----------|--------|-------|
| How is category coverage calculated? | | |
| What if a word has no category assigned? | | |
| What if a category has 0 words in pool? | | |
| How is "imbalanced category" detected? | | |

---

## Section 5: Cloze Analysis Details

### 5.1 Blank Detection

| Question | Status | Notes |
|----------|--------|-------|
| What regex patterns detect blanks? | | |
| What if there are multiple blanks in one passage? | | |
| What if blank is at start/end of sentence? | | |
| What if there's no particle after blank? | | |
| What if blank is for a particle itself? | | |

### 5.2 Answer Suggestion

| Question | Status | Notes |
|----------|--------|-------|
| How do we suggest answers for a blank? | | |
| Do we use the verb to narrow suggestions? | | |
| What if there's no verb in the sentence? | | |
| Should we check if answer key exists and validate? | | |

---

## Section 6: Rearrange Handling Details ⚠️ NEEDS MORE DETAIL

### 6.1 Detection

| Question | Status | Notes |
|----------|--------|-------|
| How is a REARRANGE item detected in JSON? | | |
| Is there an `itemType` field with value "REARRANGE"? | | |
| Or is it inferred from structure? | | |

### 6.2 Processing

| Question | Status | Notes |
|----------|--------|-------|
| What exactly is extracted from rearrange items? | | |
| Are particles extracted separately from words? | | |
| Should vocabulary from rearrange count toward frequency? | | |
| Should rearrange items affect validity calculation? | | |

### 6.3 Output

| Question | Status | Notes |
|----------|--------|-------|
| What does the response look like for rearrange items? | | |
| Is there a flag indicating "structure analysis skipped"? | | |
| Should diagnostics mention rearrange items specially? | | |

---

## Section 7: Notification Watcher Details

### 7.1 State Management

| Question | Status | Notes |
|----------|--------|-------|
| Where is watcher state stored? (localStorage? React state?) | | |
| What is the data structure for a watcher? | | |
| How long do dismissed notifications stay dismissed? | | |
| How are "ignored words" persisted? | | |

### 7.2 Re-evaluation

| Question | Status | Notes |
|----------|--------|-------|
| When does re-evaluation trigger? | | |
| How is "issue worsened" detected? | | |
| What happens if threshold changes but count doesn't? | | |
| How is "resolved" status determined? | | |

### 7.3 UI Behavior

| Question | Status | Notes |
|----------|--------|-------|
| What does a dismissed notification look like in UI? | | |
| How does "reappear" animation work? | | |
| Where is the "ignore permanently" option shown? | | |

---

## Section 8: Compliance & Validation Details

### 8.1 ます形 Detection

| Question | Status | Notes |
|----------|--------|-------|
| How is ます form detected? (string ends with ます?) | | |
| What about irregular verbs? | | |
| How is dictionary form detected to show error? | | |
| How is て-form detected? | | |
| How is past tense (ました, た) detected? | | |

### 8.2 な-adjective Detection

| Question | Status | Notes |
|----------|--------|-------|
| How do we know a word is a な-adjective? | | |
| Does Kuromoji provide this in POS tag? | | |
| What POS tag indicates な-adjective? | | |

### 8.3 Auto-fix

| Question | Status | Notes |
|----------|--------|-------|
| How does "auto-fix" convert dictionary form to ます? | | |
| Is there a conjugation library or hardcoded rules? | | |
| What if auto-fix fails (irregular verb)? | | |

---

## Section 9: API & Integration Details

### 9.1 Endpoint Design

| Question | Status | Notes |
|----------|--------|-------|
| What is the exact endpoint URL? | | |
| What is the request body structure? | | |
| What is the response structure (full)? | | |
| What HTTP status codes are used? | | |
| What happens on error? | | |

### 9.2 Lesson Scope

| Question | Status | Notes |
|----------|--------|-------|
| How is lesson scope passed in request? | | |
| What if lesson scope is not provided? | | |
| What if target lesson doesn't exist? | | |
| What if range is invalid (start > end)? | | |

### 9.3 Integration with Existing

| Question | Status | Notes |
|----------|--------|-------|
| Does new endpoint replace or coexist with v2.0? | | |
| How does new service integrate with VocabRepository? | | |
| How does new service use existing SudachiTokenizerService? | | |
| Are there circular dependencies to avoid? | | |

---

## Section 10: Frontend Integration Details

### 10.1 Tab Navigation

| Question | Status | Notes |
|----------|--------|-------|
| How are tabs implemented (state or URL)? | | |
| What component library for tabs (if any)? | | |
| Default tab when opening coach panel? | | |

### 10.2 Clickable Locations

| Question | Status | Notes |
|----------|--------|-------|
| How does clicking scroll to item? | | |
| What attribute identifies items in DOM? | | |
| How is the word highlighted after scroll? | | |
| What if item is in a collapsed section? | | |

### 10.3 Real-time Updates

| Question | Status | Notes |
|----------|--------|-------|
| When does analysis re-run? | | |
| What triggers debounced analysis? | | |
| What is the debounce delay? | | |
| How to avoid conflict with save mechanism? | | |

---

## Section 11: Missing Topics Check

Review the spec and check if these are covered:

| Topic | Covered in Spec? | Covered in Execution Guide? |
|-------|------------------|----------------------------|
| REARRANGE item type definition | | |
| REARRANGE JSON structure | | |
| Particle disambiguation (で, に) | | |
| Compound particles | | |
| Multiple blanks in cloze | | |
| Blank at sentence boundary | | |
| No verb in sentence | | |
| Empty worksheet handling | | |
| Very large worksheet handling | | |
| Unicode normalization | | |
| Mixed hiragana/katakana/kanji matching | | |
| Lesson priority weighting formula | | |
| Suggestion ranking algorithm | | |
| Score penalty exact values | | |
| Validity threshold exact values | | |
| Human-readable summary generation | | |
| Error message formats | | |
| Loading states in UI | | |
| Empty state in UI | | |

---

## Section 12: Output Summary

After completing all sections above, Opus 4.5 should produce:

### Gaps Found

List all ❌ Missing and ⚠️ Partial items:

```markdown
## Critical Gaps (Must Address Before Implementation)

1. [Topic]: [What's missing]
2. ...

## Clarification Needed (Ask User)

1. [Question that needs human input]
2. ...

## Minor Gaps (Can Infer During Implementation)

1. [Topic]: [Reasonable default to use]
2. ...
```

### Questions for User

List specific questions that only the user can answer:

```markdown
## Questions for User

1. REARRANGE: Is this a real item type in your worksheets? What's the JSON structure?
2. Particle で: Should we default to LOCATION or INSTRUMENT when ambiguous?
3. ...
```

---

## After Gap Analysis

Once gaps are identified:

1. User provides clarifications
2. Update spec documents with missing details
3. Proceed to implementation

**Do not start coding until all Critical Gaps are addressed.**
