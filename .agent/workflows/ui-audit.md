---
description: Analyze and polish UI for a single-user local web application
---

# UI Audit Workflow
This workflow guides UI analysis for a **single-user, locally-hosted** application. The goal is **readability and clarity**, not flashy design.
## User Preferences (MUST FOLLOW)
### ❌ DO NOT Add
- Hover animations (scale, shadow changes, color transitions)
- Mobile responsiveness / breakpoints
- Micro-interactions or "delightful" flourishes
- Unnecessary visual complexity
### ✅ DO Prioritize
- **Readability**: Clear typography, sufficient contrast, proper line heights
- **Functionality**: Everything visible and accessible without scrolling where possible
- **Simplicity**: Minimal visual noise, clear hierarchy
- **Consistency**: Same spacing, same colors, same patterns throughout
---
## Step 1: Take a Screenshot
```
Use browser_subagent to navigate to the target page and capture a screenshot.
Set viewport to 1280x720 (standard desktop).
```
## Step 2: Identify Anti-Patterns
Check for these common issues:
| Issue | What to Look For |
|-------|------------------|
| **Bad Alignment** | Vertical nav with large buttons, unaligned form labels |
| **Wasted Space** | Excessive padding, large margins, sparse layouts |
| **Poor Hierarchy** | All text same size, no clear sections |
| **Low Contrast** | Light gray on white, hard-to-read text |
| **Inconsistent Spacing** | Random gaps, uneven margins |
| **Visual Clutter** | Too many colors, too many borders, busy backgrounds |
## Step 3: Analyze the CSS/Components
Read the relevant style files to understand:
- What design tokens exist (colors, spacing, fonts)
- Whether styles are inline, CSS modules, or global CSS
- What needs to change to fix identified issues
## Step 4: Propose Changes
Create a checklist of specific fixes, grouped by file:
- Be specific (e.g., "reduce `.nav-button` padding from 24px to 12px")
- Explain the reasoning (e.g., "buttons are too large, causing vertical overflow")
## Step 5: Implement & Verify
1. Make the CSS/component changes
2. Take an "after" screenshot
3. Compare before/after to confirm improvement
---
## Readability Guidelines
### Typography
- Body text: 14-16px, line-height 1.5-1.6
- Headings: Clear size hierarchy (h1 > h2 > h3)
- Font: System fonts or clean sans-serif (Inter, Roboto, etc.)
### Spacing
- Use consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
- Group related items with smaller gaps
- Separate sections with larger gaps
### Colors
- Maximum 3-4 colors in UI (primary, secondary, text, background)
- Ensure WCAG AA contrast (4.5:1 for text)
- Use muted tones, avoid saturated colors
### Layout
- Horizontal navigation preferred over vertical (for desktop)
- Tables/grids for structured data
- Cards only when content naturally groups
---
## Example Audit Output
```markdown
## UI Audit: Dashboard Page
### Issues Found
1. **Navigation**: Buttons stacked vertically, each 48px tall → wastes space
2. **Typography**: All text is 14px, no visual hierarchy
3. **Spacing**: Inconsistent gaps (8px, 17px, 24px randomly)
### Proposed Fixes
- [ ] Change nav to horizontal layout
- [ ] Reduce nav button padding to 8px 16px
- [ ] Add heading sizes: h1=24px, h2=20px, h3=16px
- [ ] Standardize spacing to 8px/16px/24px scale
```
