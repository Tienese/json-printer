# Grid Box (Genkō Yōshi) - Feature Specification

## Overview

The Grid Box is a worksheet element that creates **Japanese writing practice grids** in the style of **Genkō Yōshi** (原稿用紙) - traditional Japanese manuscript paper used for handwriting practice, composition, and formal writing.

---

## Purpose & Use Cases

### Primary Purpose
Provide structured character boxes for students to practice writing Japanese characters (kanji, hiragana, katakana) with proper spacing, proportion, and stroke placement.

### Target Users
- Japanese language teachers creating practice worksheets
- Students learning Japanese writing
- Calligraphy instructors

### Common Use Cases
1. **Kanji practice** - Writing the same character repeatedly to build muscle memory
2. **Vocabulary drills** - Writing words in sequence with proper spacing
3. **Sentence composition** - Structured writing with character-per-box format
4. **Stroke order practice** - Large boxes for detailed character breakdown

---

## Grid Structure

### Character Box
Each individual square cell where one character is written.

```
┌─────────┐
│         │
│    漢   │  ← Main character area
│         │
└─────────┘
```

### With Furigana Row
Optional smaller row above each character box for phonetic reading (furigana/ruby text).

```
┌─────────┐
│  かん   │  ← Furigana row (smaller height, ~40% of main box)
├─────────┤
│         │
│    漢   │  ← Main character area
│         │
└─────────┘
```

### Grid Section
A horizontal row of character boxes that forms one line of writing.

```
┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│ 日│ 本│ 語│ の│ 練│ 習│   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

---

## Configurable Properties

### 1. Box Size
Controls the physical dimension of each character box.

| Size | Dimension | Best For |
|------|-----------|----------|
| **8mm** | 8×8mm | Dense text, advanced students, vocabulary lists |
| **10mm** | 10×10mm | Standard practice, balanced readability |
| **12mm** | 12×12mm | Beginners, stroke detail practice, younger students |

### 2. Column Count
Number of character boxes per horizontal row.

- **Range:** Typically 10-20 columns
- **Auto-calculation:** System calculates maximum columns that fit within A4 page margins
- **User override:** Can manually specify fewer columns for larger spacing

### 3. Row Count
Number of horizontal lines of character boxes.

- **Range:** Depends on box size and page space
- **Auto-pagination:** When rows exceed page height, automatically continues on next page

### 4. Furigana Toggle
Enable/disable the furigana row above each character box.

- **On:** Each box gains a smaller top section for phonetic reading
- **Off:** Simple single-cell boxes only

### 5. Guide Lines (Optional)
Visual aids inside each box to help with character proportion.

| Guide Type | Description |
|------------|-------------|
| **Cross guide** | Vertical + horizontal center lines dividing box into quadrants |
| **None** | Clean empty box |

### 6. Content Mode
What appears inside the boxes.

| Mode | Description |
|------|-------------|
| **Empty** | Blank boxes for free practice |
| **Template** | Pre-filled characters for tracing/copying |
| **Alternating** | Template character followed by empty boxes |

---

## Layout Calculation

### A4 Page Constraints
- **Page size:** 210mm × 297mm
- **Margins:** 15mm on all sides
- **Usable area:** 180mm × 267mm

### Automatic Fitting
The system calculates:

```
Max columns = floor((page_width - margins) / box_size)
Max rows = floor((page_height - margins) / effective_row_height)

Where:
  effective_row_height = box_size + (furigana_height if enabled)
  furigana_height ≈ 0.4 × box_size
```

### Example Calculations

| Box Size | Furigana | Max Columns | Max Rows per Page |
|----------|----------|-------------|-------------------|
| 8mm | Off | 22 | 33 |
| 8mm | On | 22 | 23 |
| 10mm | Off | 18 | 26 |
| 10mm | On | 18 | 19 |
| 12mm | Off | 15 | 22 |
| 12mm | On | 15 | 15 |

### Pagination
When content exceeds one page:
- Grid automatically breaks at row boundaries
- New page continues with same column structure
- Page breaks never split a row mid-line

---

## User Interactions

### In Properties Panel (Sidebar)

| Control | Type | Action |
|---------|------|--------|
| Box Size | Dropdown/Radio | Select 8mm, 10mm, or 12mm |
| Columns | Number input | Set desired column count |
| Rows | Number input | Set desired row count |
| Show Furigana | Checkbox | Toggle furigana row |
| Show Guides | Checkbox | Toggle center guide lines |

### On Canvas (Future Enhancement)

| Interaction | Action |
|-------------|--------|
| Click grid | Select this grid element |
| Double-click box | Enter inline editing mode |
| Drag edge | Resize column/row count |
| Hover between rows | Show insert indicator |

---

## Visual Specifications

### Box Styling
- **Border:** 1px solid black (0.5pt for print)
- **Border color:** Black (#000000)
- **Background:** White (#FFFFFF)
- **Guide lines:** Light gray (#CCCCCC), 0.25pt dashed

### Furigana Row
- **Height ratio:** 40% of main box height
- **Separator:** Horizontal line between furigana and main area
- **Font size (when templated):** 60% of main character font

### Print Optimization
- **Border collapse:** Adjacent boxes share borders (no double lines)
- **Clean edges:** No shadows or gradients
- **High contrast:** Pure black on white for photocopying

---

## Data Model

A Grid item contains:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `type` | "grid" | Item type discriminator |
| `boxSize` | 8 \| 10 \| 12 | Box dimension in mm |
| `columns` | number | Boxes per row |
| `rows` | number | Number of rows |
| `showFurigana` | boolean | Enable furigana row |
| `showGuides` | boolean | Show center guides |
| `content` | string[][] | Optional pre-filled characters |
| `furiganaContent` | string[][] | Optional furigana text |

---

## Constraints & Validation

| Rule | Constraint |
|------|------------|
| Minimum columns | 1 |
| Maximum columns | Based on page width and box size |
| Minimum rows | 1 |
| Maximum rows | Unlimited (pagination handles overflow) |
| Box size values | Only 8, 10, or 12mm allowed |

---

## Known Limitations (Current Implementation)

1. **No inline editing** - Must edit content in sidebar, not directly on grid
2. **No partial rows** - Cannot have rows with different column counts
3. **Fixed box sizes** - Only 3 preset sizes, no custom dimensions
4. **No diagonal guides** - Only cross guides available
5. **Changes not persisted on blur** - Need explicit save action