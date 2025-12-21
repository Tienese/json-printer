# json-printer Feature Expansion Roadmap

This document outlines a comprehensive expansion strategy, categorizing features by their data source: **Push to Canvas**, **Local Compute**, and **Future**.

---

## Phase 1: Push to Canvas Enhancements
*These features extend what we send TO Canvas.*

| Feature | Description | API | Status |
|---------|-------------|-----|--------|
| Automated Rubric | Generate & attach rubric during push | `POST rubrics` | Proposed |
| Matching Questions | Full distractor support | `POST quiz_questions` | Proposed |
| Fill-in-Blanks | Multi-variable question mapping | `POST quiz_questions` | Proposed |
| Assignment Groups | Select/create group on push | `POST/GET assignment_groups` | Proposed |

---

## Phase 2: Local Analytics (No Canvas Pull Needed)
*Implement Canvas-like analytics locally using CSV uploads or local grading.*

### 2.1 Quiz Statistics (Local)
Mirror `QuizStatisticsSubmissionStatistics` from Canvas docs.
- **Data Source**: CSV upload of student scores OR local grading in app.
- **Metrics**: Average, High, Low, Std Dev, Duration (if timed locally).
- **UI**: Dashboard view for teachers after grading.

### 2.2 Item Analysis (Local)
Mirror `QuizStatisticsQuestionStatistics` from Canvas docs.
- **Data Source**: Per-question response data from CSV or local entry.
- **Metrics**:
  - `difficulty_index`: % of students correct.
  - `discrimination_index`: Compare top vs. bottom 27% of scorers.
  - Distractor analysis for multiple choice.
- **UI**: Per-question breakdown in a report.

### 2.3 Rubric Assessment (Local)
Mirror `RubricAssessment` from Canvas docs.
- **Data Source**: Teacher grades each criterion locally.
- **Output**: Detailed feedback per student, printable report.

---

## Phase 3: Future Feature Ideas
*Inspired by Canvas API, for later implementation.*

| Canvas API | Local Equivalent | Notes |
|------------|------------------|-------|
| `quiz_submissions.md` | Submission Tracker | Track attempts and time locally |
| `peer_reviews.md` | Peer Grading Mode | Students grade each other's worksheets |
| `outcome_results.md` | Learning Outcomes | Tag questions to competencies |
| `gradebook_history.md` | Grade Audit Log | Track local grade changes |
| `modules.md` | Worksheet Sequencing | Organize worksheets into units |

---

## Summary

| Phase | Focus | Data Strategy |
|-------|-------|---------------|
| 1 | Push to Canvas | API Calls |
| 2 | Local Analytics | CSV Upload / Local Entry |
| 3 | Future | Expanded Local Features |

> **Key Insight**: Canvas API docs serve as a *blueprint* for features. Even if we can't pull data, we can re-implement the same concepts locally.
