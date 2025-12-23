# Sidebar Restructure Implementation Plan

**Objective:** Split sidebar into two distinct panels with proper separation of concerns.

---

## Current State

**Single Sidebar with 4 tabs:**
1. Layers (Outline) - item tree visualization
2. Properties (Props) - item editor
3. Timeline (History) - auto-save history ← TO BE REMOVED
4. Vocab Coach - grammar/vocabulary analysis ← TO MOVE RIGHT

---

## Target State

### LEFT SIDEBAR (Existing `Sidebar.tsx` - Simplified)
- **Title:** "Editor"
- **Tabs:** 2 only
  - `layers` - Outline + Page navigation
  - `properties` - Item properties editor
- **Remove:** History tab, Coach tab
- **Remove imports:** VocabCoachPanel, HistoryEntry, WorksheetTemplate
- **Remove props:** history, onPreviewHistory, onRenameHistory, worksheetId, worksheetJson

### RIGHT SIDEBAR (New `CoachSidebar.tsx`)
- **Title:** "Coach" / "Analysis"
- **Tabs:** Expandable for future
  - `vocab` - VocabCoachPanel (current)
  - `grammar` - Future grammar analyzer
  - `style` - Future style checker
- **Props:** worksheetId, worksheetJson
- **Independent:** Collapsible, doesn't affect left sidebar

---

## Implementation Steps

### Phase 1: Clean Up Left Sidebar

1. **Remove timeline tab entirely:**
   - Remove `'timeline'` from TabType
   - Remove timeline tab from tabs array
   - Remove timeline rendering block (lines 242-306)
   - Remove `history`, `onPreviewHistory`, `onRenameHistory` props
   - Remove unused imports: `formatTimeAgo`, `formatFullDateTime`, `HistoryEntry`, `WorksheetTemplate`
   - Remove state: `editingTimestamp`, `editValue`
   - Remove handlers: `handleStartEdit`, `handleSaveEdit`

2. **Remove vocab tab (moving to right sidebar):**
   - Remove `'vocab'` from TabType
   - Remove vocab tab from tabs array
   - Remove vocab rendering block
   - Remove `worksheetId`, `worksheetJson` props
   - Remove import: `VocabCoachPanel`

3. **Update TabType:**
   ```ts
   type TabType = 'layers' | 'properties';
   ```

4. **Update tabs array:**
   ```ts
   const tabs = [
     { id: 'layers' as TabType, label: 'Layers', icon: '☰' },
     { id: 'properties' as TabType, label: 'Props', icon: '⚙' },
   ];
   ```

### Phase 2: Create Right Sidebar

1. **Create `CoachSidebar.tsx`:**
   - Collapsible panel (starts collapsed)
   - Contains VocabCoachPanel
   - Future tabs: grammar, style analyzers
   - Props: worksheetId, worksheetJson, isOpen, onToggle

2. **Update WorksheetPage layout:**
   - Change grid from 2 columns to 3: `[40px_1fr_300px]` or `[300px_1fr_40px]`
   - Add CoachSidebar to right side
   - Pass vocab-related props to CoachSidebar

### Phase 3: Dead Code Cleanup

1. **Remove from Sidebar.tsx:**
   - `formatTimeAgo`, `formatFullDateTime` imports (if no longer used)
   - `HistoryEntry`, `WorksheetTemplate` type imports
   
2. **Check for unused files:**
   - `TimelineSidebar.tsx` - Was it already unused?
   - Any other history-related utilities

3. **WorksheetPage cleanup:**
   - Verify `history`, `onPreviewHistory`, `onRenameHistory` are still passed correctly to MenuBar

---

## Files to Modify

| File | Action |
|------|--------|
| `Sidebar.tsx` | Remove timeline/vocab, simplify |
| `WorksheetPage.tsx` | Update grid layout, add CoachSidebar |
| `CoachSidebar.tsx` | CREATE - New right panel |
| `TimelineSidebar.tsx` | CHECK if dead code |
| `dateUtils.ts` | CHECK if formatTimeAgo still needed |

---

## Testing Checklist

- [ ] Left sidebar shows only Layers and Props tabs
- [ ] Properties tab still opens when item selected
- [ ] Right sidebar (Coach) works independently
- [ ] Both sidebars collapse/expand independently
- [ ] Print layout still works correctly
- [ ] No console errors about missing props
- [ ] History is still accessible via MenuBar > Save > Timeline
