# Future Reference: Unified Question Components

> **Note:** This phase was separated from the main consolidation plan to avoid any risk of affecting print layouts.

## Goal
Merge the two question rendering systems:
- `src/components/items/` (Worksheet Builder)
- `src/components/QuestionRenderers.tsx` (Print Reports)

## Proposed Structure

### New Folder: `src/components/questions/`

| New File                  | Replaces                                               |
|---------------------------|--------------------------------------------------------|
| `QuestionWrapper.tsx`     | Shared container with number + margin                  |
| `MultipleChoice.tsx`      | `items/MultipleChoiceItem.tsx` + inline MC in PrintReport |
| `TrueFalse.tsx`           | `items/TrueFalseItem.tsx` + `TrueFalseRenderer`        |
| `Matching.tsx`            | `items/MatchingItem.tsx` + `MatchingQuestionRenderer`  |
| `FillInBlank.tsx`         | `items/ClozeItem.tsx` + `FillInBlankRenderer`          |
| `ShortAnswer.tsx`         | N/A + `ShortAnswerRenderer`                            |
| `Essay.tsx`               | N/A + `EssayQuestionRenderer`                          |

### Mode Prop
Each component supports a `mode` prop:
- `'edit'` — Full editing (Worksheet Builder, Teacher Mode)
- `'student'` — Limited editing (Worksheet Student View)
- `'print'` — Read-only, optimized for printing

## Why Deferred
- **Risk:** Print layouts are critical and must not change
- **Complexity:** High — requires careful testing of all print outputs
- **Dependencies:** Worksheet Builder and Print Reports have different data models

## When to Implement
Consider implementing when:
1. A major print layout redesign is planned
2. Sufficient testing infrastructure exists
3. User explicitly requests unification
