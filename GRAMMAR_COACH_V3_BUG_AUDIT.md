# Grammar Coach v3.0 - Bug Audit Report

**Date:** 2025-12-26
**Status:** CRITICAL BUGS FOUND
**Tester:** Manual testing with real worksheet data
**Branch:** `feature/language-coach`

---

## Executive Summary

Two critical bugs were discovered during testing that undermine the core functionality of Grammar Coach v3.0:

1. **Threshold calculation uses v1.0 algorithm** - Threshold moves with data instead of being fixed
2. **Slot detection not working** - No grammatical patterns detected despite valid input

These bugs prevent the algorithm from providing meaningful feedback.

---

## Bug 1: Threshold Moves with Data (CRITICAL)

### Description

The overuse threshold is being calculated dynamically from the worksheet data itself, causing it to increase when overuse increases. This is the exact bug that v2.0/v3.0 was designed to fix.

### Evidence

| Test | Total Words | Unique | Mean | StdDev | Threshold |
|------|-------------|--------|------|--------|-----------|
| INPUT 1 | 10 | 5 | 2.0 | 1.3 | 5 |
| INPUT 2 | 26 | 5 | 5.2 | 7.4 | 21 |

**INPUT 1 Worksheet:**
```
わたしはミラーさんです。ミラさんはアメリカ人です。わたしは会社員です。田中さんはIMCの社員です。
わたし  わたし
```

**INPUT 2 Worksheet:** (same + 18 more わたし)
```
わたしはミラーさんです。ミラさんはアメリカ人です。わたしは会社員です。田中さんはIMCの社員です。
わたし   わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし わたし
```

### Analysis

Current calculation appears to be:
```
threshold = mean + 2 * stdDev
```

- INPUT 1: 2.0 + 2(1.3) = 4.6 → 5
- INPUT 2: 5.2 + 2(7.4) = 20.0 → 21

**Problem:** Adding more わたし increases mean and stdDev, which increases threshold. So わたし at 20x is NOT flagged because threshold moved to 21.

### Expected Behavior (Per Spec)

From `GRAMMAR_ALGORITHM_SPEC.md`:
```
threshold = MAX(absolute_threshold, percentage_threshold)

Where:
- absolute_threshold = 3 (fixed, any word > 3 times is suspicious)
- percentage_threshold = 15% of vocab pool size
```

With correct implementation:
- Vocab pool size: ~50 words (from lesson range)
- 15% of 50 = 7.5 → 8
- threshold = MAX(3, 8) = **8 (FIXED)**

Expected results:
- INPUT 1: わたし ~3x, threshold 8 → OK
- INPUT 2: わたし ~20x, threshold 8 → **ERROR: exceeds by 12x**

### Root Cause

`DistributionAnalysisService.java` is calculating threshold from worksheet data, not from vocab pool size.

### Fix Required

```java
// File: DistributionAnalysisService.java

// WRONG (current implementation):
double threshold = mean + 2 * stdDev;

// CORRECT (per spec):
public int calculateFixedThreshold(int vocabPoolSize) {
    int absoluteThreshold = 3;
    int percentageThreshold = (int) Math.ceil(vocabPoolSize * 0.15);
    return Math.max(absoluteThreshold, percentageThreshold);
}
```

### Severity

**CRITICAL** - Core algorithm is fundamentally broken. No overuse will ever be detected because threshold scales with overuse.

---

## Bug 2: Slot Detection Not Working (CRITICAL)

### Description

The Grammar Coach reports "No grammatical patterns detected" and all slots show "Not Used Yet" despite the input containing clear Japanese particles.

### Evidence

**UI Output:**
```
No grammatical patterns detected.
Not Used Yet: WHO, WHAT, WHERE (at), WHERE (to), WHEN, HOW/WITH +3 more
```

**Input Text Analysis:**
```
わたし は ミラーさん です
   ↑
   は particle → Should map to SUBJECT slot

田中さん は IMC の 社員 です
    ↑         ↑
    は        の particle
```

### Expected Behavior

The input contains these particles:
- は (wa) - Topic/Subject marker - appears 4 times
- の (no) - Possessive marker - appears 1 time
- です (desu) - Copula - appears 4 times (not a slot, but structure)

Expected output:
```
Slots Used:
- SUBJECT (WHO): 4x
  - わたし (2x)
  - ミラーさん (1x)
  - 田中さん (1x)

Human-readable: "Your worksheet asks WHO (4x) but never asks WHAT, WHERE, or WHEN"
```

### Possible Causes

1. **Tokenizer not extracting particles separately**
   - Kuromoji might be merging particles with preceding words
   - Need to verify tokenization output

2. **POS tag mismatch**
   - SlotDefinition expects certain POS tags
   - Kuromoji might return different format
   - e.g., expecting "助詞" but getting "助詞-係助詞"

3. **SlotDetectionService not called**
   - Service might not be wired into GrammarAnalysisService orchestrator
   - Check if `detectSlots()` is being invoked

4. **Slot definitions not seeded**
   - Database might be empty
   - SlotSeederService might have failed silently

5. **Particle matching logic incorrect**
   - Code might be checking exact match instead of contains
   - e.g., は stored as ["は"] but Kuromoji returns "は" with different encoding

### Debug Steps Required

```java
// Add to SlotDetectionService.detectSlots():

log.info("=== SLOT DETECTION DEBUG ===");
log.info("Tokens received: {}", tokens.size());

for (TokenResult token : tokens) {
    log.info("Token: '{}' | BaseForm: '{}' | POS: '{}'",
        token.getSurface(),
        token.getBaseForm(),
        token.getPos());

    if (token.getPos().contains("助詞")) {
        log.info("  → PARTICLE DETECTED: {}", token.getSurface());
    }
}

// Check slot definitions
List<SlotDefinition> slots = slotRepository.findAll();
log.info("Slot definitions in DB: {}", slots.size());
for (SlotDefinition slot : slots) {
    log.info("  Slot: {} | Particles: {}", slot.getName(), slot.getParticles());
}
```

### Severity

**CRITICAL** - Slot analysis is a core v3.0 feature. Without it, the "Patterns" tab is useless.

---

## Test Cases to Add

### Test 1: Fixed Threshold

```java
@Test
void thresholdShouldNotChangeWithOveruse() {
    // Setup: vocab pool of 50 words for lesson range
    when(vocabRepository.countByLessonIdBetween(1, 5)).thenReturn(50L);

    String worksheet1 = "わたしは学生です。"; // わたし x1
    String worksheet2 = worksheet1 + "わたし ".repeat(20); // わたし x21

    var result1 = distributionService.analyze(worksheet1, tokens1, lessonScope);
    var result2 = distributionService.analyze(worksheet2, tokens2, lessonScope);

    // Threshold should be MAX(3, 50*0.15) = MAX(3, 8) = 8 for BOTH
    assertEquals(8, result1.getOveruseThreshold());
    assertEquals(8, result2.getOveruseThreshold());
    assertEquals(result1.getOveruseThreshold(), result2.getOveruseThreshold(),
        "Threshold must not change when overuse increases");
}
```

### Test 2: Overuse Detection

```java
@Test
void shouldFlagOverusedWord() {
    // わたし appears 20 times, threshold is 8
    String worksheet = "わたしは学生です。" + "わたし ".repeat(19);

    var result = grammarAnalysisService.analyzeV3(worksheet, lessonScope);

    var overuseDiagnostics = result.getDiagnostics().stream()
        .filter(d -> "OVERUSE".equals(d.getType()))
        .toList();

    assertFalse(overuseDiagnostics.isEmpty(), "Should flag overused words");

    var diagnostic = overuseDiagnostics.get(0);
    assertEquals("わたし", diagnostic.getTargetWord());
    assertEquals("ERROR", diagnostic.getSeverity()); // 20x vs threshold 8 = ERROR
}
```

### Test 3: Particle Detection

```java
@Test
void shouldDetectParticles() {
    String text = "わたしは学校に行きます";
    List<TokenResult> tokens = tokenizerService.tokenizeWithPos(text);

    // Verify particles are extracted
    var particles = tokens.stream()
        .filter(t -> t.getPos().contains("助詞"))
        .toList();

    assertFalse(particles.isEmpty(), "Should extract particles");
    assertTrue(particles.stream().anyMatch(p -> p.getSurface().equals("は")));
    assertTrue(particles.stream().anyMatch(p -> p.getSurface().equals("に")));
}
```

### Test 4: Slot Assignment

```java
@Test
void shouldAssignSlotsFromParticles() {
    String text = "わたしは学校に行きます";
    List<TokenResult> tokens = tokenizerService.tokenizeWithPos(text);

    var slotAssignments = slotDetectionService.detectSlots(tokens);

    assertEquals(2, slotAssignments.size());

    // は → SUBJECT
    assertTrue(slotAssignments.stream().anyMatch(s ->
        s.getSlotName().equals("SUBJECT") && s.getWord().equals("わたし")));

    // に → DIRECTION
    assertTrue(slotAssignments.stream().anyMatch(s ->
        s.getSlotName().equals("DIRECTION") && s.getWord().equals("学校")));
}
```

---

## Action Items

| Priority | Action | Owner | Status |
|----------|--------|-------|--------|
| P0 | Fix threshold calculation to use vocab pool size | Backend | TODO |
| P0 | Debug slot detection - add logging | Backend | TODO |
| P0 | Verify slot definitions are seeded correctly | Backend | TODO |
| P1 | Add unit tests for threshold calculation | Backend | TODO |
| P1 | Add unit tests for slot detection | Backend | TODO |
| P1 | Add integration test for full analysis | Backend | TODO |

---

## Files to Investigate

| File | Issue |
|------|-------|
| `DistributionAnalysisService.java` | Threshold calculation bug |
| `SlotDetectionService.java` | Not detecting particles |
| `SlotSeederService.java` | Verify slots are seeded |
| `SudachiTokenizerService.java` | Verify particle extraction |
| `GrammarAnalysisService.java` | Verify slot detection is called |

---

## Spec Reference

From `GRAMMAR_ALGORITHM_SPEC.md`:

### Threshold Calculation (Section: Score Calculation)
```
threshold = MAX(absolute_threshold, percentage_threshold)

Where:
- absolute_threshold = 3 (fixed)
- percentage_threshold = 15% of vocab pool size
```

### Slot Detection (Section: Slot Detection Algorithm)
```
FUNCTION detectSlots(tokens):
    FOR each token:
        IF token.pos == "助詞" (particle):
            markedWord = tokens[i - 1]
            slot = lookupSlotByParticle(token.surface)
            assignments.add({ word, slot, particle })
    RETURN assignments
```

---

## Conclusion

Grammar Coach v3.0 has two critical bugs that prevent it from functioning as designed:

1. The threshold calculation reverted to the broken v1.0 approach
2. Slot detection is completely non-functional

These must be fixed before the feature can be considered complete.

**Recommended:** Do not merge to main until both bugs are resolved and tests are passing.
