# Phase 2: UI Restructure Plan

**Created:** 2025-12-23  
**Status:** READY FOR IMPLEMENTATION

---

## Overview

Transform the worksheet editor UI from toolbar + sidebar layout to a menu bar + context menu architecture.

```
BEFORE:
┌──────────────────────────────────────────────────────────────┐
│ [← Back] [+ Card][+ Grid][+ Vocab][+ MC]... [Save][Load]     │  ← Toolbar with add buttons
├─────────────┬──────────────────────────────┬─────────────────┤
│  Timeline   │      Printing Area           │   Properties    │
│  (Left)     │      (A4 Canvas)             │   (Right)       │
│             │                              │   + Layers      │
└─────────────┴──────────────────────────────┴─────────────────┘

AFTER:
┌──────────────────────────────────────────────────────────────┐
│ [← Back]  [Save ▼]  [View ▼]  [Insert ▼]                     │  ← Menu Bar (dropdowns)
├──────────────────────────────────────────┬───────────────────┤
│           Printing Area                  │   Properties      │
│           (A4 Canvas)                    │   + Layers        │
│                                          │   + Timeline      │
│   [Right-click → Add Element Menu]       │   + Vocab Coach   │
│                                          │                   │
└──────────────────────────────────────────┴───────────────────┘
```

---

## 1. Menu Bar Changes (Top)

### 1.1 Remove: Add Buttons
- **DELETE:** Lines 288-305 in `WorksheetPage.tsx` (the `+ Card`, `+ Grid`, etc. buttons)

### 1.2 New: Menu Bar with Dropdowns

**Menu 1: Save**
```
┌─────────────────────────┐
│ [Save ▼]                │
├─────────────────────────┤
│ ☁ Save to Cloud         │
│ ↓ Download JSON         │
│ ↑ Load from File        │
│ ─────────────────────── │
│ 📸 Create Snapshot       │
│ ─────────────────────── │
│ 📜 Timeline ►           │
│   ├─ Auto-save 1        │
│   ├─ Auto-save 2        │
│   └─ Manual Snapshot    │
└─────────────────────────┘
```

**Menu 2: View**
```
┌─────────────────────────┐
│ [View ▼]                │
├─────────────────────────┤
│ 👤 Student View   (○)   │
│ 🎓 Teacher View   (●)   │
└─────────────────────────┘
```

**Menu 3: Insert**
```
┌─────────────────────────┐
│ [Insert ▼]              │
├─────────────────────────┤
│ 📝 Card Block           │
│ 🔲 Writing Grid         │
│ 📖 Vocabulary           │
│ ─────────────────────── │
│ ✓ Multiple Choice       │
│ ✓✗ True/False           │
│ ↔ Matching              │
│ ___ Cloze/Fill-in       │
└─────────────────────────┘
```

---

## 2. Sidebar Changes (Right)

### 2.1 Remove: Timeline from Left Sidebar
- **DELETE:** Lines 321-330 in `WorksheetPage.tsx` (Left sidebar with `<TimelineSidebar />`)
- **DELETE:** Grid column for left sidebar in line 280

### 2.2 Restructure: Right Sidebar Tabs

**New Tab Structure:**
```
┌─────────────────────────────────────┐
│ [Properties] [Layers] [Timeline] [📊] │  ← Tab bar
├─────────────────────────────────────┤
│                                     │
│   (Tab Content Here)                │
│                                     │
└─────────────────────────────────────┘
```

**Tabs:**
1. **Properties** (existing) - Element configuration
2. **Layers** (existing) - Page/item management
3. **Timeline** (moved) - History snapshots
4. **Vocab Coach** (new) - Vocabulary analysis panel

---

## 3. Context Menu Changes

### 3.1 Right-click on Printing Area (A4 Section)
**Behavior:** Shows "Add Element" menu (already exists at lines 493-535)
**Keep:** Current implementation

### 3.2 Right-click on Canvas (Gray Background)
**Behavior:** NO context menu
**Change:** Modify line 337-341 in `WorksheetPage.tsx`:
```tsx
// BEFORE:
onContextMenu={(e) => {
  if (!isPreviewMode && e.target === e.currentTarget) {
    handleContextMenu(e, 'ADD');  // <-- Remove this
  }
}}

// AFTER:
onContextMenu={(e) => {
  e.preventDefault();  // Just prevent default, no menu
}}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `WorksheetPage.tsx` | HEAVY MODIFY | Remove add buttons, add menu bar, remove left sidebar |
| `TimelineSidebar.tsx` | KEEP | Will be embedded in right sidebar tabs |
| `Sidebar.tsx` | MODIFY | Add tab system (Properties, Layers, Timeline, Vocab) |
| `MenuBar.tsx` | CREATE | New component for Save/View/Insert dropdowns |
| `VocabCoachPanel.tsx` | CREATE | New component for vocabulary analysis display |
| `SaveLoadToolbar.tsx` | DELETE | Functionality moved to MenuBar |

---

## New Component: MenuBar.tsx

```tsx
interface MenuBarProps {
  // Save menu
  onSaveToCloud: () => void;
  onSaveToFile: () => void;
  onLoadFromFile: () => void;
  onSnapshot: () => void;
  history: HistoryEntry[];
  onPreviewHistory: (template: WorksheetTemplate) => void;
  
  // View menu
  mode: ViewMode;
  onToggleMode: () => void;
  
  // Insert menu
  onAddItem: (type: string) => void;
  
  isSaving: boolean;
}

export function MenuBar({ ... }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<'save' | 'view' | 'insert' | null>(null);
  
  return (
    <div className="flex gap-1">
      {/* Save Dropdown */}
      <div className="relative">
        <button onClick={() => setOpenMenu(openMenu === 'save' ? null : 'save')}>
          Save ▼
        </button>
        {openMenu === 'save' && <SaveDropdown {...} />}
      </div>
      
      {/* View Dropdown */}
      {/* Insert Dropdown */}
    </div>
  );
}
```

---

## New Component: VocabCoachPanel.tsx

```tsx
interface VocabCoachPanelProps {
  worksheetId: number | null;
  onRefresh: () => void;
}

export function VocabCoachPanel({ worksheetId }: VocabCoachPanelProps) {
  const [analysis, setAnalysis] = useState<VocabAnalysisResult | null>(null);
  const [lessonId, setLessonId] = useState(1);
  
  const runAnalysis = async () => {
    // Call POST /api/worksheets/{id}/analyze
  };
  
  return (
    <div className="p-4">
      <h3>Vocabulary Coverage</h3>
      
      {/* Lesson Selector */}
      <select value={lessonId} onChange={e => setLessonId(Number(e.target.value))}>
        <option value={1}>Lesson 1</option>
        <option value={2}>Lesson 2</option>
        ...
      </select>
      
      <button onClick={runAnalysis}>Analyze</button>
      
      {/* Coverage Stats */}
      {analysis && (
        <>
          <div className="text-2xl font-bold">{analysis.coveragePercent}%</div>
          <div>{analysis.usedCount} / {analysis.totalVocabCount} words</div>
          
          {/* Missing Words List */}
          <h4>Missing Words</h4>
          {analysis.missingWords.map(word => (
            <div key={word.baseForm}>{word.displayForm}</div>
          ))}
        </>
      )}
    </div>
  );
}
```

---

## Implementation Order

1. **Create new components:**
   - `MenuBar.tsx`
   - `VocabCoachPanel.tsx`

2. **Modify existing components:**
   - `Sidebar.tsx` → Add tab system
   - `WorksheetPage.tsx` → Wire up new layout

3. **Delete deprecated:**
   - `SaveLoadToolbar.tsx` (after MenuBar is ready)

4. **Test:**
   - Menu dropdowns work
   - Right-click behavior correct
   - Sidebar tabs switch properly
   - Vocab analysis fetches data

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | HIGH | Implement incrementally, keep old code commented |
| Menu accessibility | MEDIUM | Use proper ARIA attributes |
| Mobile usability | LOW | Desktop-first, mobile not priority |

---

## Estimated Effort

- **MenuBar.tsx:** 2 hours
- **VocabCoachPanel.tsx:** 1 hour
- **Sidebar.tsx tabs:** 2 hours
- **WorksheetPage.tsx refactor:** 2 hours
- **Testing:** 1 hour

**Total:** ~8 hours
