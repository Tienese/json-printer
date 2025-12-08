# Print Report Feature - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                                                                   │
│  ┌─────────────────┐         ┌──────────────────┐              │
│  │  Upload Form    │  POST   │  Report View     │              │
│  │ /print-report   │────────▶│ (Printable HTML) │              │
│  │                 │         │                  │              │
│  │ - Course ID     │         │ - Student Info   │              │
│  │ - Quiz ID       │         │ - Questions      │              │
│  │ - CSV File      │         │ - Answers        │              │
│  └─────────────────┘         │ - Feedback       │              │
│                               └──────────────────┘              │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRINT REPORT CONTROLLER                       │
│                  /print-report/generate                          │
│                                                                   │
│  1. Receive: courseId, quizId, csvFile                          │
│  2. Orchestrate services                                         │
│  3. Return: PrintReport model to template                       │
└────────┬────────────────────┬────────────────────────┬──────────┘
         │                    │                        │
         ▼                    ▼                        ▼
┌───────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ CanvasQuizFetcher │  │ CsvSubmission    │  │ PrintReport     │
│                   │  │ Parser           │  │ Generator       │
│ - getQuiz()       │  │                  │  │                 │
│ - getQuestions()  │  │ - parseCSV()     │  │ - merge()       │
│                   │  │ - mapStudents()  │  │ - evaluate()    │
└────────┬──────────┘  └────────┬─────────┘  └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌───────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Canvas API      │  │   CSV File       │  │  Report Model   │
│                   │  │                  │  │                 │
│ /api/v1/courses/  │  │ Header:          │  │ - quizTitle     │
│  {id}/quizzes/    │  │  #1, #2, ...     │  │ - students[]    │
│  {id}/questions   │  │                  │  │   - name        │
│                   │  │ Data:            │  │   - questions[] │
│ Returns:          │  │  A, B, C, D      │  │     - correct?  │
│ - Quiz metadata   │  │  Student data    │  │     - feedback  │
│ - Questions[]     │  │                  │  │                 │
│ - Answers[]       │  └──────────────────┘  └─────────────────┘
│ - Feedback        │
└───────────────────┘
```

## Data Flow

```
1. USER UPLOADS CSV + IDs
   ↓
2. CONTROLLER receives request
   ↓
3. CANVAS FETCHER → Canvas API
   │ Gets: Quiz structure, Questions, Answers
   ↓
4. CSV PARSER → Reads file
   │ Gets: Student names, Response per question
   ↓
5. REPORT GENERATOR → Merges data
   │ For each student:
   │   For each question:
   │     - Compare student answer vs correct answer
   │     - Determine correctness
   │     - Select appropriate feedback
   ↓
6. TEMPLATE renders PrintReport
   │ Formats: HTML with print CSS
   ↓
7. USER receives printable page
```

## Component Responsibilities

### CsvSubmissionParser
```
Input:  MultipartFile (CSV from Canvas)
Output: List<StudentSubmission>

Parses:
- Student metadata (name, ID)
- Response mapping (#N → answer)
```

### CanvasQuizFetcher
```
Input:  courseId, quizId
Output: CanvasQuizDto + List<CanvasQuestionDto>

Fetches:
- Quiz title, description
- Questions with correct answers
- Feedback text
```

### PrintReportGenerator
```
Input:  Quiz + Questions + Submissions
Output: PrintReport (merged data)

Evaluates:
- Answer correctness per question type
- Builds feedback (general + specific)
- Creates structured report
```

### PrintReportController
```
Routes:
- GET  /print-report          → Upload form
- POST /print-report/generate → Process & render

Orchestrates all services
```

## Question Type Evaluation Logic

```
┌─────────────────────────────────────────────────────────────┐
│ Question Type        │ CSV Format    │ Evaluation Logic    │
├─────────────────────────────────────────────────────────────┤
│ Multiple Choice      │ "A" or text   │ Match single answer │
│ True/False           │ "True"/"False"│ Match boolean       │
│ Multiple Answers     │ "A,B,C"       │ Match all selected  │
│ Multiple Dropdowns   │ "ans1;ans2"   │ Match per blank     │
│ Matching            │ "pair1;pair2" │ Match all pairs     │
└─────────────────────────────────────────────────────────────┘
```

## Print Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                      [STUDENT 1]                         │ 
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Name: John Doe       ID: 12345     Quiz: Quiz 1     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Q1: Question Text                    [1.0 pts]      │ │
│ │ ───────────────────────────────────────────────────  │ │
│ │ Student Answer: A          [✓ Correct]              │ │
│ │ Feedback: General feedback text...                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Q2: Question Text                    [2.0 pts]      │ │
│ │ ───────────────────────────────────────────────────  │ │
│ │ Student Answer: C          [✗ Incorrect]            │ │
│ │ Correct Answer: B                                   │ │
│ │ Feedback: You selected C, but B is correct...       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                    ... more questions ...                │
│                                                          │
└─────────────────────────────────────────────────────────┘
                    [PAGE BREAK]
┌─────────────────────────────────────────────────────────┐
│                      [STUDENT 2]                         │
│                     ... repeat ...                       │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
Backend:
- Spring Boot 3.x
- Spring Web MVC
- RestClient (Canvas API)
- Apache Commons CSV 1.10.0

Frontend:
- Thymeleaf templates
- Pure CSS (print-optimized)
- No JavaScript required

Data Format:
- Canvas REST API (JSON)
- CSV (Canvas export format)
```

## Error Handling Flow

```
Try:
  Validate inputs
  ↓
  Fetch from Canvas
  ↓
  Parse CSV
  ↓
  Generate report
  ↓
  Render template

Catch:
  Log error details
  ↓
  Show user-friendly message
  ↓
  Redirect to upload form
```
