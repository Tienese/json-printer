---
description: Batch explore Canvas API documentation in canvas_md_docs folder
---

# Canvas API Documentation Explorer

Use this workflow when you need to find Canvas API references for implementing features.

## Quick Start

// turbo-all

### 1. List All Available Documentation Files
```bash
ls -la canvas_md_docs/ | head -50
```
This shows the 131+ Canvas API documentation files available.

---

## Topic-Based Exploration

### 2. Quiz & Assessment APIs (Most Common)
Read these files in order for quiz-related features:
- `canvas_md_docs/quizzes.md` - Classic Quizzes API
- `canvas_md_docs/quiz_questions.md` - Quiz Question structure
- `canvas_md_docs/quiz_submissions.md` - Student submission data
- `canvas_md_docs/quiz_statistics.md` - Quiz analytics

### 3. Course & Enrollment APIs
- `canvas_md_docs/courses.md` - Course management (largest doc ~230KB)
- `canvas_md_docs/enrollments.md` - Student/teacher enrollments
- `canvas_md_docs/sections.md` - Course sections
- `canvas_md_docs/users.md` - User data (~113KB)

### 4. Assignment & Grading APIs
- `canvas_md_docs/assignments.md` - Assignment management (~95KB)
- `canvas_md_docs/submissions.md` - Assignment submissions (~70KB)
- `canvas_md_docs/grades.md` - Grading APIs
- `canvas_md_docs/rubrics.md` - Rubric structures

### 5. Content & Module APIs
- `canvas_md_docs/modules.md` - Course modules (~55KB)
- `canvas_md_docs/pages.md` - Wiki pages
- `canvas_md_docs/files.md` - File management
- `canvas_md_docs/discussion_topics.md` - Discussions (~77KB)

---

## Search Strategies

### 6. Find Specific Endpoint
Use grep to search across all docs:
```bash
grep -r "GET /api/v1" canvas_md_docs/ | grep -i "your-keyword"
```

### 7. Find Data Structures
Search for response object definitions:
```bash
grep -rn "\"id\":" canvas_md_docs/ | head -30
```

### 8. Find by HTTP Method
```bash
# Find all POST endpoints
grep -r "POST /api/v1" canvas_md_docs/

# Find all DELETE endpoints  
grep -r "DELETE /api/v1" canvas_md_docs/
```

---

## Batch Read Protocol

### 9. When Asked About a Canvas Feature

**Step A:** Identify the relevant docs from the list above.

**Step B:** Read the primary documentation file:
```
view_file canvas_md_docs/[relevant-file].md
```

**Step C:** Extract the following information:
1. **Endpoint URL** (e.g., `GET /api/v1/courses/:course_id/quizzes`)
2. **Required Parameters** (path params, query params)
3. **Response Object Structure** (fields and types)
4. **Pagination** (if applicable)
5. **Authentication** (scope required)

**Step D:** Create a Java DTO/record matching the response structure.

---

## Priority Files by Feature Area

| Feature Area | Primary Doc | Size | Related Docs |
|--------------|-------------|------|--------------|
| Quiz Printing | `quizzes.md` | 16KB | `quiz_questions.md`, `quiz_submissions.md` |
| Student Data | `users.md` | 113KB | `enrollments.md` |
| Grades | `submissions.md` | 70KB | `assignments.md` |
| Course Info | `courses.md` | 232KB | `sections.md` |

---



## Notes for json-printer Project

- **No Student Sync**: Remember we use local CSV upload, not Canvas roster API
- **Focus Areas**: Quiz questions, quiz statistics, course metadata
- **DTO Pattern**: Use Java 21 `record` for all API response mappings