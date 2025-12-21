# Worksheet Dashboard & Save System

## Goal
Create a Google Docs-style dashboard for browsing worksheets, with autosave + snapshot persistence.

---

## Data Model

### Entity: `Worksheet` (Updated)
| Field | Type | Description |
|:------|:-----|:------------|
| id | Long | Primary key |
| name | String | User-defined name |
| jsonContent | TEXT | Full worksheet JSON |
| type | Enum | `AUTOSAVE`, `SNAPSHOT`, `TEMPLATE` |
| parentId | Long | FK to parent worksheet (null for snapshots/templates) |
| metadata | TEXT | JSON: `{gridCount, vocabCount, textCount, ...}` |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Save Types
- **AUTOSAVE:** Auto-saved every 25min (focused) or on blur. Max 10 per parent. Overwrites oldest.
- **SNAPSHOT:** User-triggered manual save with custom name. Unlimited.
- **TEMPLATE:** Predefined by developer. Read-only.

---

## Backend Changes

### [MODIFY] `Worksheet.java`
- Add `type` enum field
- Add `parentId` for autosave hierarchy
- Add `metadata` JSON field

### [NEW] `WorksheetMetadata.java` (Record DTO)
```java
record WorksheetMetadata(int gridCount, int vocabCount, int textCount, int mcCount, int tfCount, int matchingCount, int clozeCount) {}
```

### [MODIFY] `WorksheetStorageController.java`
| Endpoint | Description |
|:---------|:------------|
| GET `/api/worksheets?type=SNAPSHOT` | List by type |
| POST `/api/worksheets/{id}/autosave` | Create/replace autosave |
| POST `/api/worksheets/{id}/snapshot` | Create snapshot |
| POST `/api/worksheets/{id}/duplicate` | Clone worksheet |
| GET `/api/templates` | List templates |

---

## Frontend Changes

### [NEW] `WorksheetDashboardPage.tsx`
Google-style layout:
```
[+ Blank] [Template 1] [Template 2]

Recent Files (pagination)
┌─────────┬─────────┬─────────┐
│ Name    │ Name    │ Name    │
│ 3 Grid  │ 2 Vocab │ 1 Text  │
│ Dec 21  │ Dec 20  │ Dec 19  │
└─────────┴─────────┴─────────┘
[< Prev] [1] [2] [3] [Next >]
```

### [MODIFY] `App.tsx`
- `/#worksheet` → Redirect to `/#worksheet/dashboard`
- `/#worksheet/dashboard` → Dashboard page
- `/#worksheet/{id}` → Editor with specific worksheet

### [MODIFY] `TimelineSidebar.tsx`
Add sections:
- **Snapshots** (expandable, shows all)
- **Autosaves** (expandable, shows last 10)

### [NEW] `hooks/useAutosave.ts`
```typescript
- 25 min interval when tab focused
- Save on tab blur (once)
- Track last save time to prevent spam
```

### [MODIFY] `worksheetStorage.ts`
- `saveAutosave(worksheetId, data)`
- `createSnapshot(worksheetId, name)`
- `getAutosaves(worksheetId)`
- `getSnapshots(worksheetId)`

---

## Future Implementation (docs only)
- `/docs/FUTURE_PREVIEW_THUMBNAIL.md` - Visual preview on dashboard
- `/docs/FUTURE_CUSTOM_TAGS.md` - User-defined tags

---

## Verification Plan
1. Create blank → Verify autosave after 25min
2. Blur tab → Verify autosave triggers
3. Create 11 autosaves → Verify oldest is replaced
4. Create snapshot → Verify it appears in timeline
5. Dashboard → Verify pagination, metadata display

---

> [!IMPORTANT]
> **Before implementing:** Review the `Worksheet` datatype for saving. The current worksheet structure may need adjustments to support A4 page break handling for printing. Address page break logic first, then finalize the save schema.
