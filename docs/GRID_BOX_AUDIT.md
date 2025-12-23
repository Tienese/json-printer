# Grid-Box Feature Audit

**Date:** 2025-12-23  
**Auditor:** AI Assistant  
**Version:** 2.0 (Revised)

---

## 1. Scope

The Grid-Box feature is a core worksheet item type for creating **character-by-character input grids**. Primary use cases:

- Japanese Kanji/Kana writing practice with furigana annotations
- Chinese character composition
- Vietnamese/English spelling exercises
- Segmented word/sentence layouts with visual section breaks

---

## 2. Technical Specification

### 2.1 Data Model

Defined in [worksheet.ts](file:///c:/Users/luuht/Desktop/json-printer/worksheet-ui/src/types/worksheet.ts#L50-L74):

```typescript
interface GridItem {
  id: string;
  type: 'GRID';
  description: string;
  boxSize: '8mm' | '10mm' | '12mm';
  showFurigana: boolean;
  showGuides: boolean;
  hideBorderOnContent?: boolean;
  sections: GridSection[];
  // ... prompt number fields
}

interface GridSection {
  id: string;
  boxes: CharacterBox[];
}

interface CharacterBox {
  char: string;
  furigana: string;
}
```

**Hierarchy:** `GridItem` → `GridSection[]` → `CharacterBox[]`

### 2.2 Component Architecture

| File | Lines | Responsibility |
|------|-------|----------------|
| `GridItem.tsx` | 352 | Rendering, keyboard navigation, focus management |
| `useGridSections.ts` | 279 | State mutations (CRUD), assertion logging |
| `CharacterInput.tsx` | 136 | Single-box input handling, IME composition |
| `gridFocus.ts` | 73 | DOM focus targeting via data attributes |

### 2.3 State Mutation Functions

All in `useGridSections.ts`:

| Function | Trigger | State Change | Lines |
|----------|---------|--------------|-------|
| `addBox` | Space at end, typing at end | `boxes.length += 1` | 100-130 |
| `deleteBox` | Ctrl+Backspace | `boxes.length -= 1` or `sections.length -= 1` | 132-181 |
| `removeEmptyBox` | Backspace on empty box at end | `boxes.length -= 1` | 183-216 |
| `multiCommit` | IME confirmation with multiple chars | `boxes.length += chars.length` | 218-268 |
| `breakSection` | Enter | `sections.length += 1` | 57-98 |
| `insertSection` | Ctrl+Enter | `sections.length += 1` | 36-55 |

All functions are instrumented with `devAssert.check()` for runtime validation.

---

## 3. Features

| Feature | Implementation | Status |
|---------|----------------|--------|
| Single character input | `CharacterInput.onCommit()` | ✅ Working |
| Multi-character IME | `CharacterInput.onMultiCommit()` → `multiCommit()` | ✅ Working |
| Auto-expand on type | `handleAdvance()` → `addBox()` | ✅ Working |
| Backspace removal | `handleRetreat()` → `removeEmptyBox()` | ✅ Working |
| Section breaks | `onSectionBreak()` → `breakSection()` | ✅ Working |
| Arrow navigation | `handleKeyDown()` in GridItem | ✅ Working |
| Furigana input row | Separate `<input>` with `data-type="furigana"` | ✅ Working |
| Print layout optimization | `computeMergedLines()` (A4 width fitting) | ✅ Working |
| Guide lines | Toggled via `showGuides` prop | ✅ Working |
| Hide border on content | `hideBorderOnContent` prop | ✅ Working |

---

## 4. User Flows

### 4.1 Basic Typing Flow

```
User clicks empty box → box focused
User types 'A' → onCommit('A') → char stored → onAdvance() → focus next box
If at end → addBox() creates new box → focus new box
```

### 4.2 IME Composition Flow

```
User starts IME (e.g., typing 'haro-') → isComposingRef = true
User confirms 'ハロー' (3 chars) → handleCompositionEnd()
  → chars = ['ハ', 'ロ', 'ー']
  → onMultiCommit(chars)
    → multiCommit(sectionIndex=0, insertIndex=0, chars)
      → beforeInsert = [] (none before cursor)
      → insertedBoxes = [{char:'ハ'}, {char:'ロ'}, {char:'ー'}]
      → afterInsert = [existing boxes pushed right]
      → Focus moves to insertIndex + 3
```

### 4.3 Deletion Flow

```
User presses Backspace on empty box at end:
  → handleRetreat() → removeEmptyBox()
    → boxes.pop() → focus previous box

User presses Ctrl+Backspace on any box:
  → deleteBox()
    → If only box in section: delete entire section
    → Else: remove box, focus previous
```

### 4.4 Section Management Flow

```
User presses Enter mid-section:
  → breakSection(sectionIndex, boxIndex)
    → Split boxes into beforeSection and afterSection
    → sections.length += 1
    → Focus first box of new section

User presses Ctrl+Enter:
  → insertSection('after') → inserts empty section with 1 box
```

---

## 5. Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| Space | Char input | Commit + advance (or add box if at end) |
| Backspace | Empty box | Retreat to previous (or remove if at end) |
| Backspace | Box with content | Clear content (default browser behavior) |
| Ctrl+Backspace | Any box | Force delete box |
| Enter | Char input | Break section at cursor |
| Ctrl+Enter | Any | Insert new section after current |
| Ctrl+Shift+Enter | Any | Insert new section before current |
| ArrowLeft/Right | Any | Navigate within section |
| ArrowUp/Down | Furigana enabled | Toggle between char and furigana rows |
| Tab | Any | Jump to next section |
| Shift+Tab | Any | Jump to previous section |

---

## 6. Focus Management

Implemented in `gridFocus.ts`:

- Uses `data-section`, `data-box`, `data-type` attributes for targeting
- 50ms delay for async state updates (`focusGridBox`)
- 0ms delay for synchronous keyboard navigation (`focusGridBoxFromEvent`)
- `activeBox` state in component prevents race conditions

---

## 7. Known Limitations

| Issue | Description | Severity |
|-------|-------------|----------|
| Focus timing | Occasional missed focus on rapid typing/IME due to React render cycle | Low |
| Mobile IME | Not tested on mobile browsers; composition events may differ | Unknown |
| Cross-section navigation | ArrowLeft/Right stops at section boundaries | By Design |
| Undo/Redo | Not implemented; relies on autosave history | Medium |

---

## 8. Observability

All state mutations are logged via `devAssert.check()` to capture:

- Expected vs actual box/section counts
- Cursor position after operation
- Full state snapshot on anomaly detection

Query endpoint: `GET /api/dev/logs/anomalies`

---

## 9. Files Summary

| File | LOC | Purpose |
|------|-----|---------|
| `GridItem.tsx` | 352 | Main component |
| `useGridSections.ts` | 279 | State hook with CRUD + assertions |
| `CharacterInput.tsx` | 136 | IME-aware single-char input |
| `gridFocus.ts` | 73 | Focus utility |
| `worksheetFactory.ts` | 114 | Factory functions (incl. `createGridItem`) |

**Total Grid-Box codebase:** ~954 lines of TypeScript/React
---

## 10. Practical Verification Results (2025-12-23)

Verified via live browser interaction on `localhost:8080`.

### 10.1 Functional Pass/Fail

| Test Case | Interaction | Result | Status |
|-----------|-------------|--------|--------|
| **Initialization** | Add "+ Grid" from toolbar | Grid Item created with default 1 box | ✅ PASS |
| **Auto-Expansion** | Press Space at end of section | New box appended, focus advanced | ✅ PASS |
| **Section Break** | Press Enter mid-section | Section split into two lines with gap | ✅ PASS |
| **Deletion** | Ctrl + Backspace | Focused box removed, items shifted | ✅ PASS |
| **Furigana** | Type in upper input field | Text rendered correctly above char | ✅ PASS |
| **Character Override** | Type in box with existing char | **Appends character instead of replacing** | ❌ **BUG** |

### 10.2 Bug Report: Character Accumulation
**Observation:** When a box already contains a character (e.g., "a") and the user navigates back to it and types another character (e.g., "b"), the box content becomes "ab".  
**Expected Behavior:** A grid box should only contain a single character. Typing in a filled box should override the previous value.  
**Root Cause:** `CharacterInput.tsx` uses a standard text input without a `maxLength` (for IME support) and does not implement "select-on-focus" or custom "replace-first-char" logic for Latin characters.

### 10.3 Trace Log Evidence
Observed standard `AI_TRACE` events for `ITEM_ADDED` and `ITEM_UPDATED` during the session, confirming that the logging infrastructure is capturing grid state changes correctly.

### 10.4 Japanese IME Verification (2025-12-23)

Performed dedicated IME simulation testing with Japanese character strings.

| Test Case | Interaction | Result | Status |
|-----------|-------------|--------|--------|
| **IME Commitment** | Commit "ハロー" (3 chars) | Split into 3 boxes: [ハ][ロ][ー] | ✅ PASS |
| **Focus Advance** | After IME commit | Focus moved to box *after* the last char | ✅ PASS |
| **Logic Integrity** | `multiCommit` handler | Asserted via devAssert (MULTI_COMMIT) | ✅ PASS |

**Assertion Log (Verified from Backend):**
```json
{
  "component": "useGridSections",
  "action": "MULTI_COMMIT",
  "message": "IME insert \"ハロー\" at index 0",
  "expected": { "boxCount": 4, "insertedChars": "ハロー", "cursorIndex": 3 },
  "actual": { "boxCount": 4, "insertedChars": "ハロー", "cursorIndex": 3 }
}
```
*Note: boxCount=4 because the grid initialized with 1 empty box, and 3 were inserted.*
