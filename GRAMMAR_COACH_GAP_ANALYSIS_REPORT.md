# Grammar Coach v3.0 - Gap Analysis Report

**Date:** 2025-12-25  
**Auditor:** Gemini CLI Agent  
**Status:** Phase 0B Complete - Questions for User

---

## Prerequisite Check

- [x] **PHASE 0A COMPLETE:** Audit report produced (GRAMMAR_COACH_AUDIT_REPORT.md)
- [x] **SPEC READ:** GRAMMAR_ALGORITHM_SPEC.md read completely

---

## Section 1: Existing Code Understanding

### 1.1 Current Services

| Question | Status | Notes |
|----------|--------|-------|
| What does `GrammarAnalysisService.analyze()` currently return? | ✅ Documented | Returns `GrammarAnalysisResult(totalWordsScanned, uniqueWordsFound, posCounts, violations, score)` |
| What methods does `WorksheetScannerService` have? | ✅ Documented | `extractAllText()`, `extractVocabTerms()`, `extractGridBoxes()`, `extractMCOptions()`, `extractMatchingMatches()`, `extractClozePassage()`, `addIfJapanese()`, `containsJapanese()` |
| How does `SudachiTokenizerService.tokenizeWithPos()` work? | ✅ Documented | Uses Lucene Kuromoji JapaneseAnalyzer, returns `List<TokenResult(surface, baseForm, pos)>`, filters particles/symbols |
| What is the current `GrammarAnalysisResult` DTO structure? | ✅ Documented | Java record with: totalWordsScanned, uniqueWordsFound, posCounts, violations, score |
| How does `VocabSeederService` import CSV data? | ✅ Documented | CommandLineRunner on startup, scans `csv/lesson_*.csv`, WIPE policy per lesson, single-column UTF-8 |
| What does `GrammarRuleService.getEnabledRules()` return? | ✅ Known | Returns `List<GrammarRule>` where enabled=true, ordered by priority DESC |

### 1.2 Current Entities

| Question | Status | Notes |
|----------|--------|-------|
| What fields does `Vocab` entity currently have? | ✅ Documented | id, lessonId, displayForm, baseForm, partOfSpeech |
| What fields does `VocabTag` entity have? | ✅ Documented | id, name (unique), category, description, examples |
| How does `VocabTagMapping` link vocab to tags? | ✅ Documented | M2M join table with vocab_id FK, tag_id FK |
| What is the structure of `GrammarRule` entity? | ✅ Documented | id, name, ruleType (enum), targetTag (M2O), targetWord, threshold, suggestionText, enabled, priority |
| What is the structure of `RuleSuggestion` entity? | ✅ Documented | id, rule (M2O to GrammarRule), suggestedWord, context, priority |

### 1.3 Current Frontend

| Question | Status | Notes |
|----------|--------|-------|
| How does `GrammarCoachPanel.tsx` fetch analysis data? | ✅ Documented | Calls `POST /api/worksheets/{id}/analyze-grammar` or `POST /api/grammar/analyze` |
| How does `CoachSidebar.tsx` organize the panels? | ✅ Documented | 3 tabs (vocab, grammar, style) with useState for activeTab |
| Does `VocabCoachPanel.tsx` exist? What does it do? | ✅ Documented | Yes, provides vocab gap analysis |
| Does `StyleCoachPanel.tsx` exist? What does it do? | ✅ Documented | Yes, style checking - **marked for removal per spec** |
| How are worksheet items rendered in the main editor? | ✅ Documented | Via `WorksheetPage` → `items[]` array, component per type |
| What is the worksheet state structure in React? | ✅ Documented | `WorksheetState { pages[], currentPageIndex, selectedItem, mode, metadata }` |

---

## Section 2: Worksheet Item Types

### VOCAB Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of a VOCAB item? | ✅ | `{ id, type: 'VOCAB', columns, fontSize, terms: VocabTerm[], ... }` |
| Which fields should be extracted for analysis? | ✅ | `terms[].term` (Japanese word) |
| Which fields should be IGNORED? | ✅ | `terms[].meaning` (Vietnamese translation) |
| How is `term` vs `meaning` distinguished? | ✅ | `term` is Japanese, `meaning` is translation - extracted by field name |
| Can VOCAB items have multiple terms? Structure? | ✅ | Yes, `terms` is an array of `VocabTerm { id, term, meaning, ... }` |

### GRID Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of a GRID item? | ✅ | `{ id, type: 'GRID', sections: GridSection[], boxSize, ... }` |
| Is content a single string or array of boxes? | ✅ | Array: `sections[].boxes[]` where each box has `char` and `furigana` |
| How are `sections` and `boxes` organized? | ✅ | sections[] → each section has boxes[] → each box has char/furigana |
| What is extracted: `content` or `boxes[].value`? | ⚠️ Mismatch | Scanner uses `boxes[].value` but TS type has `boxes[].char` - **potential bug** |
| Are there guide lines or metadata to ignore? | ✅ | Section labels ignored, only box values extracted |

### MULTIPLE_CHOICE Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ✅ | `{ id, type: 'MULTIPLE_CHOICE', prompt, options: string[], correctIndex }` |
| What is a `prompt` vs `options`? | ✅ | prompt = question text, options = answer choices |
| Should prompts be analyzed or ignored? | ✅ | Ignored (usually Vietnamese/English) |
| How are options structured? | ✅ | `options: string[]` in TS, scanner extracts `options[].text` - **check if object or string** |
| Is there a correct answer marker? | ✅ | `correctIndex` field - not treated differently in analysis |

### MATCHING Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure of pairs? | ✅ | `{ pairs: MatchPair[] }` where `MatchPair { left, right }` |
| What is `match` vs `prompt` in a pair? | ⚠️ Mismatch | TS type has `left/right`, Scanner extracts `pairs[].match` - **check actual JSON** |
| Should both sides be analyzed or just one? | ✅ | Only `match` (Japanese side) extracted |
| How many pairs typically exist? | ⚠️ Unknown | Need sample data |

### CLOZE Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ✅ | `{ id, type: 'CLOZE', template, answers: string[], blankWidth }` |
| Is `passage` a single string or structured? | ⚠️ Mismatch | TS has `template`, Scanner extracts `passage` - **field name mismatch** |
| What blank patterns are used? | ✅ (from spec) | `＿{2,}`, `_{2,}`, `【\s*】`, `（\s*）`, `\(\s*\)`, `\[\s*\]` |
| Is there an `answers` field? | ✅ | Yes, `answers: string[]` |
| Should we analyze passage WITH blanks? | ✅ (spec) | Analyze surrounding context, infer expected slot from particle after blank |

### REARRANGE Item ⚠️ CRITICAL GAP
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ❌ **NOT FOUND** | No REARRANGE type in worksheet.ts types |
| Is it called something else in code? | ❌ **Unknown** | Need to search codebase |
| Are fragments stored as array? | ❌ **Unknown** | |
| How do we detect this type? | ❌ **Unknown** | |
| What EXACTLY should be extracted? | ❌ **Unknown** | Spec says vocabulary-only mode |

### TRUE_FALSE Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ✅ | `{ type: 'TRUE_FALSE', prompt, questions: TrueFalseQuestion[] }` |
| Why is this skipped entirely? | ✅ | Contains only prompts (usually not Japanese) |
| Is statement in Japanese? | ⚠️ | Could be, but typically prompts are instructions |

### CARD Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ✅ | `{ type: 'CARD', content, language, cardStyle }` |
| What is `content` field? | ✅ | Single string |
| What is CARD used for? | ✅ | Notes, instructions, text blocks |

### HEADER Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ✅ | `{ type: 'HEADER', title, showName, showDate }` |
| Why is this ignored? | ✅ | Metadata, not content |

### TEXT Item
| Question | Status | Notes |
|----------|--------|-------|
| What is the JSON structure? | ❌ **NOT FOUND** | No TEXT type in worksheet.ts - may not exist |

---

## Section 3: Slot Detection Details

### 3.1 Particle Disambiguation
| Question | Status | Notes |
|----------|--------|-------|
| で can be LOCATION or INSTRUMENT - how to distinguish? | ⚠️ Spec silent | v3.0 uses simple particle → slot mapping, **no disambiguation logic** |
| に can be DIRECTION or TIME - how to distinguish? | ⚠️ Spec silent | Same issue - need heuristics or defer to v4.0 |
| が can be SUBJECT or OBJECT - documented? | ✅ In spec | Documented as future (v4.0) - requires predicate-aware analysis |
| What happens if particle is ambiguous? | ⚠️ Needs decision | **Question for user: default assignment?** |
| Should we track ambiguity in response? | ⚠️ Not specified | Could add `isAmbiguous` flag |

### 3.2 Slot Detection Algorithm
| Question | Status | Notes |
|----------|--------|-------|
| What if word has NO particle (sentence-final verb)? | ⚠️ Needs logic | Verbs don't get slots - they define the predicate |
| What if particle attached to word by Kuromoji? | ✅ Handled | Kuromoji separates particles with POS filter |
| How to handle compound particles (には, では)? | ⚠️ Not specified | Need to split or treat as unit |
| What slot does verb itself belong to? | ⚠️ Not specified | Verb is the PREDICATE, not a slot filler |
| How to handle copula (です, だ)? | ⚠️ Not specified | Copula links subject to predicate |

### 3.3 Edge Cases
| Question | Status | Notes |
|----------|--------|-------|
| What if sentence has no verb? | ⚠️ | Noun predicates exist (Xです) - treat です as copula |
| What if sentence is incomplete? | ⚠️ | Common in worksheets - best effort analysis |
| What about questions (か)? | ✅ | か is sentence-final, not a case particle |
| What about quotations (と)? | ⚠️ | と for quoting vs と for companion - complex |

---

## Section 4: Distribution Analysis Details

### 4.1 Threshold Calculation
| Question | Status | Notes |
|----------|--------|-------|
| How is `expected_per_word` calculated? | ✅ In spec | `total_word_count / unique_word_count` |
| How is standard deviation calculated? | ✅ In spec | `stddev(word_counts)` |
| Formula for overuse threshold? | ✅ In spec | `expected + (2 × std_deviation)` |
| Formula for underuse threshold? | ✅ In spec | `0` or `< expected - std_deviation` |
| What if only 1 unique word? | ⚠️ Edge case | Division by 1 is fine, but stddev = 0 |
| What if all words appear exactly once? | ✅ In spec | Context-dependent response based on coverage % |

### 4.2 Category Analysis
| Question | Status | Notes |
|----------|--------|-------|
| How is category coverage calculated? | ✅ In spec | `words_used_with_tag / words_in_pool_with_tag` |
| What if word has no category? | ⚠️ Gap | Vocab entity doesn't have category field yet |
| What if category has 0 words in pool? | ⚠️ Edge case | Skip from calculation, note in response |
| How is imbalance detected? | ✅ In spec | If one category < 30% but others > 60% |

---

## Section 5: Cloze Analysis Details

### 5.1 Blank Detection
| Question | Status | Notes |
|----------|--------|-------|
| What regex patterns detect blanks? | ✅ In spec | Pattern provided in spec |
| Multiple blanks in one passage? | ⚠️ Not specified | Iterate and analyze each |
| Blank at start/end of sentence? | ⚠️ Edge case | May lack context particles |
| No particle after blank? | ⚠️ Edge case | Cannot infer slot |
| Blank is for a particle itself? | ⚠️ Edge case | Different analysis needed |

### 5.2 Answer Suggestion
| Question | Status | Notes |
|----------|--------|-------|
| How to suggest answers? | ✅ In spec | Use slot + verb constraints + lesson vocab |
| Use verb to narrow suggestions? | ✅ In spec | Yes, via `verb_slot_constraint` (v4.0) |
| No verb in sentence? | ⚠️ Edge case | Use slot default tags only |
| Check answer key exists? | ⚠️ Optional | Can validate against `answers[]` field |

---

## Section 6: Rearrange Handling ⚠️ CRITICAL GAP

### 6.1 Detection
| Question | Status | Notes |
|----------|--------|-------|
| How is REARRANGE detected in JSON? | ❌ **UNKNOWN** | Type not found in worksheet.ts |
| Is there an `itemType` field? | ❌ **UNKNOWN** | Need to verify if this type exists |
| Or inferred from structure? | ❌ **UNKNOWN** | |

### 6.2 Processing
| Question | Status | Notes |
|----------|--------|-------|
| What exactly is extracted? | ✅ In spec | Tokens extracted, particles found, content words |
| Are particles extracted separately? | ✅ In spec | Yes |
| Should vocabulary count toward frequency? | ✅ In spec | Yes, word frequency counted |
| Should rearrange affect validity? | ⚠️ Implied | Vocab counts, structure skipped |

### 6.3 Output
| Question | Status | Notes |
|----------|--------|-------|
| What does response look like? | ⚠️ Partial | "Rearrange question - vocabulary analyzed, structure skipped" |
| Is there a flag for structure skipped? | ⚠️ Not specified | Should add |
| Diagnostics mention rearrange? | ⚠️ Not specified | Should add note |

---

## Section 7: Notification Watcher Details

### 7.1 State Management
| Question | Status | Notes |
|----------|--------|-------|
| Where is watcher state stored? | ⚠️ Not specified | **Suggest: React state + localStorage** |
| Data structure for watcher? | ✅ In spec | `NotificationWatcher { id, targetItemIndex, targetWord, severity, status, threshold, currentCount }` |
| How long dismissed stays dismissed? | ✅ In spec | Until issue worsens, then reappears |
| How are ignored words persisted? | ⚠️ Not specified | **Suggest: localStorage** |

### 7.2 Re-evaluation
| Question | Status | Notes |
|----------|--------|-------|
| When does re-evaluation trigger? | ⚠️ Implied | On each analysis run |
| How is "worsened" detected? | ✅ In spec | `newCount > watcher.currentCount` |
| Threshold changes but count doesn't? | ✅ In spec | Downgrade severity if ratio improves |
| How is "resolved" determined? | ✅ In spec | `newCount <= newThreshold` |

### 7.3 UI Behavior
| Question | Status | Notes |
|----------|--------|-------|
| What does dismissed look like? | ✅ In spec | Small gray message "Watching: X - will reappear if count increases" |
| How does reappear work? | ⚠️ Implied | Re-render as active notification |
| Where is "ignore permanently" shown? | ✅ In spec | Button in notification card |

---

## Section 8: Compliance & Validation Details

### 8.1 ます形 Detection
| Question | Status | Notes |
|----------|--------|-------|
| How is ます form detected? | ✅ | `word.endsWith("ます")` |
| What about irregular verbs? | ⚠️ Handle manually | する→します, 来る→きます |
| How is dictionary form detected? | ⚠️ Complex | Need verb conjugation rules |
| How is て-form detected? | ⚠️ Complex | Ends with て/で |
| How is past tense detected? | ⚠️ Complex | Ends with た/だ or ました |

### 8.2 な-adjective Detection
| Question | Status | Notes |
|----------|--------|-------|
| How do we know word is な-adjective? | ✅ | Kuromoji POS tag |
| Does Kuromoji provide this? | ✅ | Yes, POS = 形容動詞 |
| What POS tag indicates な-adjective? | ✅ | `形容動詞-*` |

### 8.3 Auto-fix
| Question | Status | Notes |
|----------|--------|-------|
| How does auto-fix work? | ⚠️ Not implemented | `convertToMasuForm(word)` referenced but not defined |
| Is there a conjugation library? | ❌ No | Need to implement or use library |
| What if auto-fix fails? | ⚠️ Not specified | Return error, suggest manual fix |

---

## Section 9: API & Integration Details

### 9.1 Endpoint Design
| Question | Status | Notes |
|----------|--------|-------|
| What is the endpoint URL? | ✅ Exists | `POST /api/worksheets/{id}/analyze-grammar`, `POST /api/grammar/analyze` |
| Request body structure? | ✅ Partial | v2.0: `{ worksheetJson }`. v3.0 needs: `{ worksheetJson, lessonScope }` |
| Response structure (full)? | ❌ Needs redesign | v2.0 structure differs from v3.0 spec |
| HTTP status codes? | ✅ Standard | 200, 400, 404 |
| Error handling? | ⚠️ Basic | Returns empty or error message |

### 9.2 Lesson Scope
| Question | Status | Notes |
|----------|--------|-------|
| How is lesson scope passed? | ❌ **NOT IN V2.0** | v3.0 requires `lessonScope { mode, target, range? }` |
| What if not provided? | ⚠️ Need default | **Question: use all lessons?** |
| What if target lesson doesn't exist? | ⚠️ Edge case | Return `validity: "INVALID"` |
| What if range is invalid? | ⚠️ Edge case | Return 400 Bad Request |

### 9.3 Integration with Existing
| Question | Status | Notes |
|----------|--------|-------|
| Replace or coexist with v2.0? | ⚠️ **Question for user** | Backward compatibility needed? |
| Integration with VocabRepository? | ✅ Yes | Already uses findAll() |
| Integration with SudachiTokenizerService? | ✅ Yes | Already uses tokenizeWithPos() |
| Circular dependencies? | ✅ None found | Services have clear hierarchy |

---

## Section 10: Frontend Integration Details

### 10.1 Tab Navigation
| Question | Status | Notes |
|----------|--------|-------|
| How are tabs implemented? | ✅ | useState in CoachSidebar |
| Component library? | ✅ | Plain Tailwind, no library |
| Default tab? | ✅ | 'vocab' |

### 10.2 Clickable Locations
| Question | Status | Notes |
|----------|--------|-------|
| How to scroll to item? | ✅ In spec | `document.querySelector([data-item-index])` |
| What attribute identifies items? | ⚠️ Need to add | `data-item-index` |
| How is word highlighted? | ⚠️ Need to implement | Pulse animation |
| If item in collapsed section? | ⚠️ Edge case | Expand first |

### 10.3 Real-time Updates
| Question | Status | Notes |
|----------|--------|-------|
| When does analysis re-run? | ⚠️ Not implemented | Currently manual button click |
| Debounce trigger? | ⚠️ Not implemented | Per spec: after meaningful threshold |
| Debounce delay? | ⚠️ Not specified | **Suggest: 1000ms** |
| Conflict with save? | ⚠️ Need care | Don't block save |

---

## Section 11: Missing Topics Check

| Topic | Covered in Spec? | Gap? |
|-------|------------------|------|
| REARRANGE item type definition | ⚠️ Partially | **JSON structure unknown** |
| Particle disambiguation (で, に) | ❌ No | **Needs decision** |
| Compound particles | ❌ No | **Needs handling** |
| Multiple blanks in cloze | ❌ No | Minor |
| Blank at sentence boundary | ❌ No | Edge case |
| No verb in sentence | ❌ No | Edge case |
| Empty worksheet handling | ⚠️ Implied | Return empty result |
| Very large worksheet handling | ⚠️ "max 10 pages" | Minor |
| Unicode normalization | ❌ No | **Potential issue** |
| Mixed hiragana/katakana/kanji matching | ❌ No | **Potential issue** |
| Lesson priority weighting formula | ✅ Yes | HIGH before LOW |
| Suggestion ranking algorithm | ✅ Yes | Lesson priority → Usage → POS match |
| Score penalty exact values | ✅ Yes | errors×15, warnings×5, imbalance×10 |
| Validity threshold exact values | ✅ Yes | HIGH: ≥60% overall, ≥30% min category |
| Human-readable summary generation | ✅ Yes | Example provided |
| Error message formats | ✅ Yes | Examples in spec |
| Loading states in UI | ❌ No | Minor |
| Empty state in UI | ❌ No | Minor |

---

## Critical Gaps (Must Address Before Implementation)

1. **REARRANGE Item Type**: Not found in `worksheet.ts`. Is this a real item type? What's the JSON structure?

2. **Vocab Entity Missing Fields**: Need to add `category` (VARCHAR) and `aspects` (JSON TEXT) columns

3. **SlotDefinition Table**: Completely new entity needed - not in current codebase

4. **Location Tracking**: WorksheetScannerService returns `List<String>`, needs to return `List<ExtractedContent>` with itemIndex, charStart, charEnd

5. **Lesson Scope Parameter**: v2.0 analyzes ALL vocab, v3.0 needs lesson range filtering

6. **Response Structure Redesign**: `GrammarAnalysisResult` needs complete redesign for v3.0 (meta, distribution, diagnostics, slotAnalysis, clozeAnalysis, score)

7. **Field Name Mismatches**:
   - GRID: Scanner uses `boxes[].value`, TS type has `boxes[].char`
   - CLOZE: Scanner uses `passage`, TS type has `template`
   - MATCHING: Scanner uses `pairs[].match`, TS type has `pairs[].left/right`

---

## Clarification Needed (Questions for User)

1. **REARRANGE Item**: Does your worksheet builder support a REARRANGE/sentence scramble item type? If yes, what's the JSON structure?

2. **Particle Disambiguation**: When で/に are ambiguous, should we:
   - (a) Default to most common usage (で→LOCATION, に→DIRECTION)
   - (b) Flag as ambiguous and skip slot assignment
   - (c) Something else?

3. **Backward Compatibility**: Should v3.0 API:
   - (a) Replace v2.0 endpoint entirely
   - (b) Coexist as new endpoint (e.g., `/api/grammar/v3/analyze`)
   - (c) Provide both with adapter layer

4. **Lesson Scope Default**: If `lessonScope` not provided, should we:
   - (a) Analyze against ALL lessons
   - (b) Return error requiring scope
   - (c) Use a default (e.g., most recent lesson)

5. **StyleCoachPanel Removal**: Confirm: Should StyleCoachPanel.tsx be deleted? Or repurposed?

6. **Notification Watcher Priority**: Is this a must-have for v3.0, or can it be deferred to v3.1?

---

## Minor Gaps (Can Infer During Implementation)

1. **Debounce Delay**: Use 1000ms (common default)
2. **Empty Worksheet**: Return `{ meta: { validity: "LOW" }, ... }` with note
3. **Loading States**: Add `isLoading` spinner, standard pattern
4. **Empty State**: "No analysis results yet. Click Analyze to start."
5. **Compound Particles**: Treat first particle as case marker (には→に, では→で)
6. **No Verb Sentence**: Skip slot analysis, count vocabulary only

---

## Ready for Pre-Implementation

After user answers questions:
1. Update spec with clarifications
2. Create seed data files (slot definitions, N5 vocab with categories)
3. Proceed to [GRAMMAR_COACH_PRE_IMPLEMENTATION.md](./GRAMMAR_COACH_PRE_IMPLEMENTATION.md)

**Do not start coding until all Critical Gaps are addressed.**
