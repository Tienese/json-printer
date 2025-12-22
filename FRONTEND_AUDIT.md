# JSON-Printer Frontend Audit Report
**Generated:** 2025-12-22

---

## 1. Architecture Overview

**Type:** Single Page Application (SPA)
**Stack:** React 19, TypeScript, Vite, Tailwind CSS
**Routing:** Hash-based (`#/worksheet`, `#/dashboard`) via `src/navigation`

### Core Design Patterns
- **Container-Presenter** with hooks (`useWorksheet`) as state container
- **Local-First Persistence** via `localStorage` (offline-tolerant)
- **Print-First CSS** with `@page { margin: 0 }` for A4 control

---

## 2. Dead Code Findings

| Component | Path | Status |
| :--- | :--- | :--- |
| **RichTextToolbar** | `src/components/worksheet/RichTextToolbar.tsx` | ❌ Unused |
| **InsertBlock** | `src/components/InsertBlock.tsx` | ❌ Unused |

### Active Code (Verified)
- `GridItemEditor` → Used by `Sidebar.tsx`
- `QuestionRenderers` → Used by `PrintReportViewPage.tsx`
- `FeatureSidebar` → Used by `LandingPage.tsx`
- All utilities (`aiLogger`, `htmlSanitizer`, `dateUtils`) → Active

---

## 3. Refactoring Plan

### Phase 1: Dead Code Removal ✅
- Delete `RichTextToolbar.tsx`
- Delete `InsertBlock.tsx`
- Delete empty `worksheet/` directory

### Phase 2: Directory Restructuring
- Rename `components/new` → `components/items`
- Rename `components/editors` → `components/property-editors`

### Phase 3: Performance Optimization
- Add `React.memo` to `CharacterInput`
- Add `useMemo` to `computeMergedLines` in `GridItem`

### Phase 4: Context API (Optional)
- Create `WorksheetContext.tsx` to reduce prop-drilling

---

## 4. Key Technical Details

### State Management (`useWorksheet.ts`)
- Manages `pages[]` array for multi-page support
- `recalculatePromptNumbers()` ensures sequential numbering across all pages
- Handles `selectedItem` for focus management

### Print System (`tailwind.css`)
- `@page { margin: 0 }` gives app full control over A4 layout
- `.print-page` enforces `min-height: 297mm` (A4 height)
- `page-break-before: always` for multi-page breaks

### Resilience (`useAutoSave.ts`)
- `worksheet_autosave_v2`: Current active draft
- `worksheet_history_v2`: Rolling log of 10 auto-saves + manual snapshots
- Saves every 25 minutes; detects `document.hidden` for background save

---

## 5. Potential Improvements
- **Performance:** `React.memo` for `CharacterInput` (deep component tree)
- **Architecture:** `WorksheetContext` to reduce prop-drilling
- **Bundle Size:** API client uses native `fetch` (no Axios)

---

## 6. Deep-Dive Function Analysis

### 6.1 State Management Hook: `useWorksheet.ts`

| Function | Complexity | Called When | Call Chain |
|:---|:---:|:---|:---|
| `recalculatePromptNumbers()` | 🔴 High | After every `addItem` / `deleteItem` | Iterates ALL pages → ALL items → assigns sequential numbers |
| `addItem()` | 🟡 Medium | User clicks "+ Grid/Text/etc" | `createItemByType()` → `addItem()` → `recalculatePromptNumbers()` |
| `updateItem()` | 🟢 Low | Any property change in Sidebar | `Sidebar.onUpdate()` → `useWorksheet.updateItem()` |
| `setAllPages()` | 🟡 Medium | Load from file | `loadWorksheetFromFile()` → `setAllPages()` |
| `addVocabTerm()` / `addTFQuestion()` | 🟢 Low | "Add Term" button | Type-specific convenience wrappers |

**⚠️ Complexity Warning:** `recalculatePromptNumbers()` runs O(n*m) where n=pages, m=items. Could become slow with 50+ items across 10+ pages.

---

### 6.2 Grid Interaction Hook: `useGridSections.ts`

| Function | Complexity | Called When |
|:---|:---:|:---|
| `multiCommit()` | 🔴 High | IME confirms multi-char input (Japanese/Chinese) |
| `breakSection()` | 🟡 Medium | User presses Enter mid-section |
| `insertSection()` | 🟢 Low | Ctrl+Enter to add new section |
| `deleteBox()` | 🟡 Medium | Ctrl+Backspace |
| `removeEmptyBox()` | 🟢 Low | Backspace on empty trailing box |

**Call Chain Example (IME Input):**
```
User types "あいう" → compositionEnd →
CharacterInput.handleCompositionEnd() →
  onMultiCommit(['あ','い','う']) →
    useGridSections.multiCommit() →
      Inserts 3 boxes, pushes existing content right →
      focusGridBox(sectionIndex, insertIndex + 3)
```

---

### 6.3 Component: `CharacterInput.tsx`

**Purpose:** Single-character input with IME (Japanese/Chinese) support.

| Function | Description |
|:---|:---|
| `handleCompositionStart()` | Sets `isComposingRef = true` to block other handlers |
| `handleCompositionEnd()` | Commits single char OR triggers `onMultiCommit` for multi-char |
| `handleKeyDown()` | Handles Space/Enter/Backspace for navigation |
| `handleBlur()` | Auto-commits on focus loss |

**⚠️ Coupling:** Tightly coupled with `GridItem` through 6 callback props (`onCommit`, `onMultiCommit`, `onAdvance`, `onRetreat`, `onSectionBreak`).

---

### 6.4 Component: `GridItem.tsx`

**Complexity:** 🔴 **High** (346 lines, 10+ callback handlers)

| Function | Description |
|:---|:---|
| `computeMergedLines()` | Line-wraps sections for A4 print (180mm width) |
| `handleKeyDown()` | Arrow keys, Tab, Ctrl+Enter, Ctrl+Backspace |
| `handleBoxChange()` | Updates single character in state |
| `handleFuriganaChange()` | Updates furigana reading |
| `handleDescriptionInput()` | Rich-text description with sanitization |

**Dependencies:**
- Uses `useGridSections` hook for CRUD
- Uses `gridFocus.ts` for DOM focus management
- Uses `htmlSanitizer.ts` for XSS protection

---

### 6.5 Component: `Sidebar.tsx`

**Pattern:** Polymorphic Editor Dispatch

```typescript
switch (selectedItem.type) {
  case 'HEADER': return <HeaderItemEditor ... />;
  case 'GRID':   return <GridItemEditor ... />;
  case 'TEXT':   return <TextItemEditor ... />;
  // ... 8 total cases
}
```

**⚠️ Coupling:** 18 props passed down from `WorksheetPage`. This is the primary candidate for `WorksheetContext` refactor.

---

### 6.6 Utility: `htmlSanitizer.ts`

| Function | Purpose |
|:---|:---|
| `sanitizeHTML()` | Recursive DOM tree cleaner. Allows: `<b>`, `<i>`, `<u>`, `<br>`, lists |
| `sanitizePaste()` | Intercepts clipboard, sanitizes HTML before insertion |
| `stripAllTags()` | Returns plain text only |
| `isValidHTML()` | Validation check |

**Security:** Prevents XSS by stripping all disallowed tags and ALL attributes.

---

### 6.7 Utility: `gridFocus.ts`

| Function | Purpose |
|:---|:---|
| `focusGridBox()` | Direct DOM query to focus a specific box (50ms delay) |
| `focusGridBoxFromEvent()` | Uses event target's container (0ms delay for keyboard) |

**⚠️ DOM Coupling:** Uses `data-*` attributes as selectors. Breaking these attributes breaks focus navigation.

---

## 7. Coupling Analysis

| Coupled Pair | Type | Risk |
|:---|:---|:---|
| `Sidebar` ↔ `WorksheetPage` | Prop-drilling (18 props) | 🟡 Medium - Maintenance burden |
| `CharacterInput` ↔ `GridItem` | Callback props (6) | 🟡 Medium - Tight coordination |
| `GridItem` ↔ `gridFocus.ts` | DOM selectors | 🔴 High - Breaking `data-*` attrs breaks focus |
| `useWorksheet` ↔ `worksheetFactory` | Factory pattern | 🟢 Low - Clean separation |

---

## 8. Additional Dead/Deprecated Code

| File | Issue | Recommendation |
|:---|:---|:---|
| `RichTextToolbar.tsx` | 0 imports | ❌ DELETE |
| `InsertBlock.tsx` | 0 imports | ❌ DELETE |
| `components/worksheet/` | Empty after deletion | ❌ DELETE directory |
| `isValidHTML()` in htmlSanitizer | 0 usages found | ⚠️ Consider DELETE |

---

## 9. User Flow: Adding a Grid Item

```
1. User clicks "+ Grid" button in toolbar
2. WorksheetPage.addItem(createGridItem(), items.length)
3. useWorksheet.addItem() inserts item at index
4. recalculatePromptNumbers() renumbers all items
5. setSelectedItem(newItem) triggers Sidebar tab switch
6. Sidebar.renderEditor() returns <GridItemEditor />
7. User clicks a grid box
8. GridItem sets activeBox state
9. focusGridBox() queries DOM, calls input.focus()
10. User types Japanese via IME
11. CharacterInput.handleCompositionEnd()
12. onMultiCommit() → useGridSections.multiCommit()
13. Boxes inserted, content pushed right
14. focusGridBox() moves focus to next empty box
```
