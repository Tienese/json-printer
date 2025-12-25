# Grammar Analysis Algorithm - Technical Specification

> **Version:** 2.0 (Fixed Threshold)  
> **Date:** 2025-12-25

---

## Problem with Previous Algorithm (v1.0)

### The Flaw
The v1.0 algorithm calculated threshold dynamically from the worksheet content:
```
threshold = mean(word_counts) + 1.5 * stddev(word_counts)
```

**Problem:** If you keep adding "わたし", the mean and stddev BOTH increase, so the threshold moves with it!

| わたし Count | Threshold | Flagged? |
|-------------|-----------|----------|
| 11 | 9 | ✅ Yes |
| 18 | 15 | ✅ Yes (but threshold moved!) |
| 44 | ~38 | ✅ Still flagged, but wrong behavior |

The threshold should be **FIXED**, not calculated from the data being analyzed.

---

## New Algorithm (v2.0) - Fixed Threshold

### Approach: Percentage-Based + Absolute Cap

A word is flagged as OVERUSE if:

```
count > MAX(absolute_threshold, percentage_threshold)

Where:
- absolute_threshold = 3 (fixed, any word > 3 times is suspicious)
- percentage_threshold = 15% of unique vocab words used
```

### Example

| Unique Words | 15% Threshold | Absolute | Effective Threshold |
|--------------|---------------|----------|---------------------|
| 10 | 1.5 → 2 | 3 | 3 |
| 20 | 3 | 3 | 3 |
| 50 | 7.5 → 8 | 3 | 8 |
| 100 | 15 | 3 | 15 |

### Why This Works

1. **Fixed baseline** - threshold doesn't move when you add more of the same word
2. **Scales with worksheet size** - larger worksheets allow more repetition
3. **Absolute floor** - small worksheets still catch overuse

---

## Implementation

```java
// FIXED threshold calculation
int uniqueWords = wordCounts.size();
int percentageThreshold = Math.max(3, (int) Math.ceil(uniqueWords * 0.15));
int absoluteThreshold = 3;
int threshold = Math.max(absoluteThreshold, percentageThreshold);

// Flag any word exceeding threshold
for (entry : wordCounts) {
    if (entry.count > threshold) {
        violations.add(entry.word);
    }
}
```

### Key Difference from v1.0

| | v1.0 (Broken) | v2.0 (Fixed) |
|---|---|---|
| **Threshold** | Calculated from data | Fixed formula |
| **わたし × 44** | Threshold = ~38 | Threshold = 3 (or 15% of vocab) |
| **Adding more** | Threshold increases | Threshold stays same |

---

## Filtering Rules

### What Gets Counted
- Japanese text only (Hiragana, Katakana, Kanji regex)
- Words that exist in vocab database (lesson CSVs)
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

## API Response

```json
{
  "totalWordsScanned": 50,
  "uniqueWordsFound": 15,
  "threshold": 3,
  "violations": [
    {
      "targetWord": "わたし",
      "actualCount": 44,
      "threshold": 3,
      "message": "'わたし' appears 44 times (max: 3)"
    }
  ],
  "score": 80
}
```
