# Recent Changes Risk Assessment

**Generated:** 2025-12-23

**Review Commits:**
- `4e27849` - feat: UX improvements for worksheet builder

---

## 🔴 CRITICAL RISKS

### 1. ❌ Interactive Section Missing `print:hidden`

**File:** `WorksheetPage.tsx` (line 406-408)
**Issue:** The interactive editing `<section>` has zoom transform applied but lacks `print:hidden` class.

```tsx
<section
  className={`relative mb-10 bg-white shadow-... ${isPreviewMode ? '...' : ''}`}
  style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 297 + 40}mm` }}
>
```

**Risk:** If printing occurs while the print overlay (line 483) fails to render, the zoomed section may print with incorrect scaling.

**Status:** ⚠️ NEEDS FIX - Add `print:hidden` to interactive section

**Fix:**
```tsx
className={`... print:hidden ${isPreviewMode ? '...' : ''}`}
```

---

## 🟡 MEDIUM RISKS

### 2. ⚠️ Sidebar Grid Layout Change

**File:** `WorksheetPage.tsx` (line 279)
**Change:** Grid columns changed from `[1fr_300px]` to `[300px_1fr]`

**Before:** `grid-cols-[1fr_300px]` (sidebar on right)
**After:** `grid-cols-[300px_1fr]` (sidebar on left)

**Risk:** The print layout uses `print:block` which overrides grid, but elements might render in different order than expected.

**Status:** ✅ LOW RISK - Print uses separate div with `print:block`

---

### 3. ⚠️ Zoom Margin Calculation

**File:** `WorksheetPage.tsx` (line 408)
**Code:** `marginBottom: ${(zoom - 1) * 297 + 40}mm`

**Risk:** At extreme zoom values:
- zoom=0.5: marginBottom = `-108.5mm` (negative!)
- zoom=2.0: marginBottom = `337mm`

**Impact:** Negative margin could cause visual overlap or scroll issues.

**Status:** ⚠️ NEEDS FIX - Clamp margin to minimum 0

**Fix:**
```tsx
marginBottom: `${Math.max(0, (zoom - 1) * 297) + 40}mm`
```

---

### 4. ⚠️ Focus Style Removal May Affect Accessibility

**Files:** `TrueFalseItem.tsx`, `MultipleChoiceItem.tsx`, `MatchingItem.tsx`, `HeaderItem.tsx`, `CardItem.tsx`
**Change:** Replaced `hover:bg-[#eef] focus:bg-[#eef]` with `focus:outline-dashed focus:outline-1 focus:outline-gray-300`

**Risk:** 
- Users relying on visual focus indicators may find dashed outline harder to see
- The subtle gray dashed outline may not meet WCAG contrast requirements

**Status:** ⚠️ MINOR - Consider adjusting outline color/width for better visibility

---

## 🟢 LOW RISKS

### 5. ✅ Select-on-Focus Behavior

**File:** `inputUtils.ts`
**Change:** Added `selectAllContentOnFocus` for contentEditable elements

**Risk:** Users who prefer cursor placement (click-to-position) may find select-all behavior unexpected

**Status:** ✅ ACCEPTABLE - Standard UX pattern for placeholder/default text replacement

---

### 6. ✅ Grid Alignment and Furigana Font Size

**Files:** `worksheet.ts`, `GridItemEditor.tsx`, `GridItem.tsx`
**Change:** Added `alignment` and `furiganaFontSize` properties

**Risk:** None - new optional properties with sensible defaults

**Status:** ✅ SAFE

---

### 7. ✅ MenuBar Dropdown Alignment

**File:** `MenuBar.tsx`
**Change:** Changed `absolute left-0` to `absolute right-0`

**Risk:** Dropdowns now align to right edge instead of left

**Status:** ✅ INTENDED - Prevents dropdowns from going off-screen on right side

---

## 📋 REQUIRED FIXES

| Priority | File | Line | Issue | Fix |
|----------|------|------|-------|-----|
| 🔴 HIGH | WorksheetPage.tsx | 407 | Missing `print:hidden` on section | Add class |
| 🟡 MEDIUM | WorksheetPage.tsx | 408 | Negative margin at low zoom | Use `Math.max(0, ...)` |

---

## 🧪 TESTING CHECKLIST

- [ ] Print worksheet at zoom=50% - verify 100% size output
- [ ] Print worksheet at zoom=200% - verify 100% size output
- [ ] Open sidebar, verify no layout shift
- [ ] Close sidebar, verify content stays centered
- [ ] Tab through interactive elements - verify focus visible
- [ ] Test grid alignment (left/center/right) prints correctly
- [ ] Test furigana font size changes render correctly
