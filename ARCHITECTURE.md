# QTI Helper - Complete Architecture Documentation

**Optimized for LLM Reading**

This document provides comprehensive architecture documentation for the QTI Helper application, a Spring Boot web application that generates printable student quiz reports by merging Canvas LMS quiz data with student CSV submissions.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Package Structure](#package-structure)
3. [Data Models](#data-models)
4. [Service Layer](#service-layer)
5. [Controller Layer](#controller-layer)
6. [Data Flow Pipeline](#data-flow-pipeline)
7. [Key Algorithms](#key-algorithms)
8. [Template Layer](#template-layer)
9. [Configuration](#configuration)
10. [Technology Stack](#technology-stack)

---

## System Overview

### Purpose
Generate printable B&W-optimized quiz reports that display student answers with visual feedback markers (✓, ✗, ▲).

### Core Workflow
```
User Input (Course ID, Quiz ID, CSV File)
    ↓
Canvas API Fetch (Quiz + Questions)
    ↓
CSV Parsing (Student Submissions)
    ↓
Report Generation (Merge + Evaluate)
    ↓
ViewModel Mapping (View Optimization)
    ↓
Template Rendering (Printable HTML)
```

### Design Patterns
- **Service Layer Pattern**: Business logic separated into services
- **View Model Pattern**: Separation between business data and presentation data
- **DTO Pattern**: Canvas API data encapsulated in immutable records
- **Repository-like Pattern**: Services act as data sources

---

## Package Structure

```
com.qtihelper.demo/
├── config/
│   └── CanvasProperties.java
│       Purpose: Configuration properties for Canvas API
│       Annotation: @ConfigurationProperties(prefix = "app.canvas")
│       Fields: url, token
│
├── controller/
│   └── PrintReportController.java
│       Purpose: HTTP request handling and workflow orchestration
│       Routes: GET /print-report, POST /print-report/generate
│       Dependencies: All 4 services (fetcher, parser, generator, mapper)
│
├── dto/canvas/
│   ├── CanvasQuizDto.java          (Quiz metadata from API)
│   ├── CanvasQuestionDto.java      (Question structure with answers)
│   ├── CanvasAnswerDto.java        (Answer options, weight=100 means correct)
│   └── CanvasMatchDto.java         (Matching question pairs)
│       Purpose: Immutable data transfer objects for Canvas API responses
│       Type: Java records (immutable)
│
├── model/
│   ├── StudentSubmission.java      (Parsed CSV student data)
│   ├── PrintReport.java            (Business model: merged + evaluated data)
│   ├── QuizPrintViewModel.java     (View model: optimized for templates)
│   └── AnswerStatus.java           (Enum: CORRECT, INCORRECT, UNANSWERED)
│       Purpose: Domain models and view models
│
└── service/
    ├── CanvasQuizFetcher.java      (Canvas API client)
    ├── CsvSubmissionParser.java    (CSV file parser)
    ├── PrintReportGenerator.java   (Core business logic)
    └── QuizPrintViewModelMapper.java (ViewModel transformer)
        Purpose: Business logic and data transformation services
```

---

## Data Models

### 1. Canvas DTOs (Immutable Records)

#### CanvasQuizDto
**Location**: `dto/canvas/CanvasQuizDto.java`
**Purpose**: Quiz metadata from Canvas API

```java
record CanvasQuizDto(
    Long id,                  // Quiz ID
    String title,             // Quiz title
    String description,       // Quiz description (HTML)
    Integer questionCount     // Number of questions
)
```

#### CanvasQuestionDto
**Location**: `dto/canvas/CanvasQuestionDto.java`
**Purpose**: Complete question structure with answers and feedback

```java
record CanvasQuestionDto(
    Long id,                          // Question ID
    String questionName,              // Question name/title
    String questionText,              // Question text (HTML)
    String questionType,              // Type (see table below)
    Integer position,                 // Question order (can be null)
    Double pointsPossible,            // Points for this question
    String correctComments,           // Feedback for correct answers (HTML)
    String incorrectComments,         // Feedback for incorrect answers (HTML)
    String neutralComments,           // General feedback shown to all (HTML)
    List<CanvasAnswerDto> answers,    // Answer options
    List<CanvasMatchDto> matches      // For matching questions
)
```

**Question Types**:
| Type | Description | CSV Format |
|------|-------------|------------|
| `multiple_choice_question` | Single correct answer | "A" or "Answer text" |
| `true_false_question` | True/False | "True" or "False" |
| `multiple_answers_question` | Multiple correct answers | "A,B,C" or "Ans1,Ans2" |
| `multiple_dropdowns_question` | Multiple blanks with dropdowns | "ans1;ans2;ans3" |
| `matching_question` | Match pairs | "pair1;pair2" |

#### CanvasAnswerDto
**Location**: `dto/canvas/CanvasAnswerDto.java`
**Purpose**: Individual answer option

```java
record CanvasAnswerDto(
    Long id,              // Answer ID
    String text,          // Answer text (HTML)
    Integer weight,       // 100 = correct, 0 = incorrect
    String comments,      // Answer-specific feedback (HTML)
    String blankId        // For fill-in-blank questions
) {
    boolean isCorrect() {
        return weight != null && weight == 100;
    }
}
```

### 2. Domain Models

#### StudentSubmission
**Location**: `model/StudentSubmission.java`
**Purpose**: Parsed student data from CSV

```java
class StudentSubmission {
    String firstName;              // Student first name
    String lastName;               // Student last name
    String studentId;              // Student ID
    Map<Integer, String> responses; // Question# → Answer text

    String getFullName();          // Returns "firstName lastName"
}
```

#### PrintReport (Business Model)
**Location**: `model/PrintReport.java`
**Purpose**: Merged quiz data with student evaluations (business logic output)

```java
class PrintReport {
    String quizTitle;
    List<StudentReport> studentReports;

    static class StudentReport {
        StudentSubmission student;
        List<QuestionResult> questionResults;
    }

    static class QuestionResult {
        CanvasQuestionDto question;      // Full question DTO
        String studentAnswer;            // Student's answer text
        boolean isCorrect;               // Evaluation result
        List<String> correctAnswers;     // List of correct answer texts
        String feedbackToShow;           // Consolidated feedback (HTML)
    }
}
```

**Key Design Decision**: `QuestionResult` contains the full `CanvasQuestionDto` object, enabling flexible access to all question metadata during report generation.

### 3. View Models

#### QuizPrintViewModel
**Location**: `model/QuizPrintViewModel.java`
**Purpose**: View-optimized structure for template rendering (flattened, pre-computed values)

```java
class QuizPrintViewModel {
    String quizTitle;
    int studentCount;
    List<StudentQuizView> students;

    static class StudentQuizView {
        String studentName;                  // Full name
        String studentId;
        List<QuestionView> questions;
        List<Integer> incorrectQuestionNumbers;  // For retake section
    }

    static class QuestionView {
        int questionNumber;                  // 1-based position
        String questionText;                 // Plain text (HTML stripped)
        double pointsPossible;
        String questionType;
        List<OptionView> options;            // Pre-computed option list
        String studentAnswerText;
        boolean isCorrect;
        AnswerStatus answerStatus;           // CORRECT, INCORRECT, UNANSWERED
        String feedbackText;                 // HTML feedback
        boolean hasOptions;                  // True if options exist
    }

    static class OptionView {
        String optionLetter;                 // "A", "B", "C", "D", etc.
        String optionText;                   // Plain text (HTML stripped)
        boolean isCorrect;                   // Is this the correct answer?
        boolean isStudentAnswer;             // Did student select this?
        String visualMarker;                 // "✓", "✗", "▲", or ""
        String commentText;                  // Answer-specific feedback
    }
}
```

**Visual Marker Logic**:
- `✓` : Correct answer AND student selected it
- `✗` : Incorrect answer AND student selected it
- `▲` : Correct answer NOT selected (shown only when question is wrong)
- `""` : No marker (other cases)

#### AnswerStatus (Enum)
**Location**: `model/AnswerStatus.java`
**Purpose**: Tri-state answer status

```java
enum AnswerStatus {
    CORRECT,      // Student answered correctly
    INCORRECT,    // Student answered incorrectly
    UNANSWERED    // Student did not answer (null/empty/"No answer")
}
```

### Data Model Comparison: Business vs View

| Aspect | PrintReport (Business) | QuizPrintViewModel (View) |
|--------|------------------------|---------------------------|
| **Purpose** | Evaluation logic | Template rendering |
| **Question Data** | Full `CanvasQuestionDto` object | Flattened fields |
| **Options** | Accessed via `question.answers()` | Pre-computed `List<OptionView>` |
| **Option Letters** | Not assigned | Pre-assigned (A, B, C, D) |
| **Visual Markers** | Not computed | Pre-computed (✓, ✗, ▲) |
| **HTML Content** | Preserved | Stripped to plain text |
| **Boolean Flags** | Derived from data | Pre-computed per option |

---

## Service Layer

### 1. CanvasQuizFetcher

**Location**: `service/CanvasQuizFetcher.java`
**Purpose**: Fetch quiz data from Canvas API
**Dependencies**: `CanvasProperties`, `RestClient`

#### Key Methods

```java
CanvasQuizDto getQuiz(String courseId, String quizId)
```
- **Endpoint**: `GET /api/v1/courses/{courseId}/quizzes/{quizId}`
- **Returns**: Quiz metadata
- **Error Handling**: Throws `HttpClientErrorException` (401, 403, 404, 429)

```java
List<CanvasQuestionDto> getQuizQuestions(String courseId, String quizId)
```
- **Endpoint**: `GET /api/v1/courses/{courseId}/quizzes/{quizId}/questions`
- **Returns**: List of questions with answers and feedback
- **Note**: Canvas API returns questions unsorted; sorting handled by `PrintReportGenerator`

#### Authentication
Uses Bearer token authentication:
```java
.header("Authorization", "Bearer " + canvasProperties.token())
```

---

### 2. CsvSubmissionParser

**Location**: `service/CsvSubmissionParser.java`
**Purpose**: Parse Canvas CSV exports into `StudentSubmission` objects
**Dependencies**: Apache Commons CSV

#### Key Methods

```java
List<StudentSubmission> parseSubmissions(MultipartFile csvFile) throws IOException
```

#### CSV Format Expected

**Header Row**:
```
Student First Name, Student Last Name, Student ID, #1 Student Response, #2 Student Response, ...
```

**Data Rows**:
```
John, Doe, 12345, A, B, C, ...
```

#### Parsing Logic
1. Read header row to identify question columns (`#1 Student Response`, `#2 Student Response`, etc.)
2. For each data row:
   - Extract student metadata (name, ID)
   - Map question numbers to responses
   - Create `StudentSubmission` with `Map<Integer, String>` responses

**Implementation Reference**: `CsvSubmissionParser.java:parseSubmissions()`

---

### 3. PrintReportGenerator

**Location**: `service/PrintReportGenerator.java`
**Purpose**: Core business logic - merge quiz data with student submissions and evaluate answers
**Dependencies**: None (pure business logic)

#### Key Methods

```java
PrintReport generateReport(
    CanvasQuizDto quiz,
    List<CanvasQuestionDto> questions,
    List<StudentSubmission> submissions
)
```
**Line Reference**: Lines 22-105

**Algorithm**:
1. Sort questions by position (null → 0) - Lines 34-37
2. For each student submission:
   - Create `StudentReport`
   - For each question (1-based indexing):
     - Get student answer from submission map
     - Create `QuestionResult`
     - Call `evaluateAnswer()` to determine correctness
     - Call `buildFeedback()` to consolidate feedback
     - Track correct count
3. Return complete `PrintReport`

```java
void evaluateAnswer(
    CanvasQuestionDto question,
    String studentAnswer,
    PrintReport.QuestionResult result
)
```
**Line Reference**: Lines 107-140

**Algorithm**:
1. Switch on `question.questionType()`
2. Delegate to type-specific evaluator:
   - `evaluateMultipleChoice()` - Lines 142-185
   - `evaluateMultipleAnswers()` - Lines 187-246
   - `evaluateMultipleDropdowns()` - Lines 248-270
   - `evaluateMatching()` - Lines 272-290
3. Set `result.isCorrect` and `result.correctAnswers`
4. Call `buildFeedback()` to consolidate all feedback

#### Evaluation Logic by Question Type

##### Multiple Choice / True-False
**Line Reference**: Lines 142-185

**Algorithm**:
1. Extract correct answer texts from `question.answers()` where `weight=100`
2. Try matching by letter:
   - If student answer is single uppercase letter (e.g., "A")
   - Convert to index: `'A' → 0, 'B' → 1`
   - Check if `question.answers().get(index).isCorrect()`
3. Fallback to text matching:
   - Compare `studentAnswer` with correct answer texts (case-insensitive)
4. Set `result.isCorrect`

##### Multiple Answers
**Line Reference**: Lines 187-246

**Algorithm**:
1. Extract correct answer texts
2. Split student answer by comma/semicolon: `studentAnswer.split("[,;]")`
3. For each student answer part:
   - If single letter: convert to answer text using index
   - Otherwise: use text directly
4. Build student answer list
5. Check correctness:
   - Same count as correct answers
   - All student answers match correct answers (case-insensitive)

##### Multiple Dropdowns
**Line Reference**: Lines 248-270

**Algorithm**:
1. Extract correct answer texts by `blank_id`
2. Check if student answer contains correct texts
3. **Note**: Simplified implementation; may need refinement for complex formats

##### Matching
**Line Reference**: Lines 272-290

**Algorithm**:
1. Extract correct matches
2. Check if student answer contains correct match texts
3. **Note**: Simplified implementation; assumes Canvas export includes match text

```java
void buildFeedback(
    CanvasQuestionDto question,
    PrintReport.QuestionResult result
)
```
**Line Reference**: Lines 292-333

**Feedback Consolidation Algorithm**:
1. Add **general feedback** (`neutralComments`) - shown to all students
2. Add **correctness feedback**:
   - If correct: add `correctComments`
   - If incorrect: add `incorrectComments`
3. Add **answer-specific feedback**:
   - Iterate through `question.answers()`
   - If student answer contains answer text, add `answer.comments()`
4. Wrap each feedback type in HTML div with class:
   - `.feedback-general`
   - `.feedback-correct` / `.feedback-incorrect`
   - `.feedback-answer-specific`
5. Set `result.feedbackToShow` with consolidated HTML

#### Helper Methods

```java
String stripHtml(String text)
```
**Line Reference**: Lines 335-338
- Removes HTML tags: `text.replaceAll("<[^>]*>", "").trim()`
- Used to extract plain text for comparison

---

### 4. QuizPrintViewModelMapper

**Location**: `service/QuizPrintViewModelMapper.java`
**Purpose**: Transform `PrintReport` (business model) to `QuizPrintViewModel` (view model)
**Dependencies**: None

#### Key Methods

```java
QuizPrintViewModel mapToViewModel(
    CanvasQuizDto quiz,
    List<CanvasQuestionDto> questions,
    List<StudentSubmission> submissions,
    PrintReport report
)
```
**Line Reference**: Lines 40-60

**Algorithm**:
1. Create `QuizPrintViewModel`
2. Set quiz title and student count
3. For each `StudentReport` in report:
   - Call `mapStudent()` to create `StudentQuizView`
   - Add to view model
4. Return view model

```java
StudentQuizView mapStudent(PrintReport.StudentReport studentReport)
```
**Line Reference**: Lines 65-95

**Algorithm**:
1. Create `StudentQuizView`
2. Set student name (full name) and ID
3. Initialize question counter (1-based)
4. For each `QuestionResult`:
   - Call `mapQuestion()` to create `QuestionView`
   - Add to student view
   - If incorrect or unanswered, add question number to `incorrectQuestionNumbers`
   - Increment counter
5. Return student view

```java
QuestionView mapQuestion(
    PrintReport.QuestionResult result,
    int questionNumber
)
```
**Line Reference**: Lines 100-134

**Algorithm**:
1. Create `QuestionView`
2. Set question number (1-based)
3. Set question text (HTML stripped)
4. Set points possible (null → 0.0)
5. Set question type
6. Set student answer text (null → "No answer")
7. Set correctness flag
8. Determine answer status: `determineAnswerStatus()` - Lines 272-280
   - If answer is null/empty/"No answer" → `UNANSWERED`
   - Else if correct → `CORRECT`
   - Else → `INCORRECT`
9. Set feedback text (HTML preserved)
10. If question has answers:
    - Set `hasOptions = true`
    - Call `mapOptions()` to create option list
11. Return question view

```java
List<OptionView> mapOptions(
    CanvasQuestionDto question,
    PrintReport.QuestionResult result
)
```
**Line Reference**: Lines 139-171

**Algorithm**:
1. Create option list
2. For each `CanvasAnswerDto` in `question.answers()`:
   - Create `OptionView`
   - Assign option letter: `(char)('A' + index)` → "A", "B", "C", etc.
   - Set option text (HTML stripped)
   - Set `isCorrect` from `answer.weight == 100`
   - Determine if student selected: `isStudentAnswerMatch()` - Lines 182-237
   - Compute visual marker: `computeVisualMarker()` - Lines 253-263
   - Set comment text (HTML stripped if present)
   - Add to list
3. Return option list

```java
boolean isStudentAnswerMatch(
    CanvasAnswerDto answer,
    String studentAnswer,
    int index,
    CanvasQuestionDto question
)
```
**Line Reference**: Lines 182-237

**Algorithm** (by question type):
1. If student answer is null/empty/"No answer" → `false`
2. Switch on question type:
   - **Multiple Choice / True-False**:
     - If single uppercase letter: match by index (`'A' + index`)
     - Else: match by text (case-insensitive)
   - **Multiple Answers**:
     - Split student answer by comma/semicolon
     - For each part: try letter match or text match
     - Return `true` if any match
   - **Multiple Dropdowns**:
     - Check if student answer contains option text
   - **Matching**:
     - Check if student answer contains option text
   - **Default**:
     - Simple text match (case-insensitive)

```java
String computeVisualMarker(
    boolean isCorrect,
    boolean isStudentAnswer,
    boolean isQuestionCorrect
)
```
**Line Reference**: Lines 253-263

**Algorithm**:
```
if (isCorrect AND isStudentAnswer):
    return "✓"
else if (NOT isCorrect AND isStudentAnswer):
    return "✗"
else if (isCorrect AND NOT isStudentAnswer AND NOT isQuestionCorrect):
    return "▲"  // Show missed correct answer only when question is wrong
else:
    return ""
```

#### Helper Methods

```java
String stripHtml(String text)
```
**Line Reference**: Lines 288-293
- Same as `PrintReportGenerator.stripHtml()`

---

## Controller Layer

### PrintReportController

**Location**: `controller/PrintReportController.java`
**Purpose**: HTTP request handling and workflow orchestration
**Annotation**: `@Controller`

#### Dependencies
```java
CanvasQuizFetcher canvasFetcher;
CsvSubmissionParser csvParser;
PrintReportGenerator reportGenerator;
QuizPrintViewModelMapper viewModelMapper;
```

#### Endpoints

##### GET /
**Line Reference**: Lines 47-50
- Redirects to `/print-report`

##### GET /print-report
**Line Reference**: Lines 52-55
- Returns `print-report-upload` template (upload form)

##### POST /print-report/generate
**Line Reference**: Lines 57-202

**Parameters**:
- `courseId` (String, required)
- `quizId` (String, required)
- `csvFile` (MultipartFile, required)
- `reportType` (String, default="slip") - "slip" or "full"

**Algorithm**:
1. **Input Validation** (Lines 71-101):
   - Check courseId not blank
   - Check quizId not blank
   - Check csvFile not empty
   - Check file extension is `.csv`
   - If any fail: redirect with error message

2. **Step 1: Fetch Quiz** (Lines 105-115):
   - Call `canvasFetcher.getQuiz(courseId, quizId)`
   - Log duration
   - If null: redirect with error

3. **Step 2: Fetch Questions** (Lines 117-127):
   - Call `canvasFetcher.getQuizQuestions(courseId, quizId)`
   - Log duration
   - If empty: redirect with error

4. **Step 3: Parse CSV** (Lines 129-140):
   - Call `csvParser.parseSubmissions(csvFile)`
   - Log duration
   - If empty: redirect with error

5. **Step 4: Generate Report** (Lines 142-147):
   - Call `reportGenerator.generateReport(quiz, questions, submissions)`
   - Log duration

6. **Step 5: Map to ViewModel** (Lines 149-154):
   - Call `viewModelMapper.mapToViewModel(quiz, questions, submissions, report)`
   - Log duration

7. **Render Template** (Lines 156-167):
   - Add `quizzes` (List of viewModel) to model
   - Add `studentCount` to model
   - Determine view name:
     - "full" → `print-report-view`
     - "slip" → `print-report-slip`
   - Log total duration and performance breakdown
   - Return view name

#### Error Handling
**Line Reference**: Lines 169-201

**Exception Types**:
1. `HttpClientErrorException` (Canvas API errors):
   - 401: "Invalid Canvas API token"
   - 403: "Access denied"
   - 404: "Quiz not found"
   - 429: "Rate limit exceeded"

2. `IOException` (CSV reading errors):
   - "Failed to read CSV file"

3. `IllegalArgumentException` (Invalid data):
   - "Invalid data in CSV or quiz"

4. `Exception` (Unexpected errors):
   - "Unexpected error occurred"
   - Full stack trace logged

All errors redirect to upload form with flash attribute `error`.

#### Logging Strategy
- Structured logging with step markers: "Step X/Y: [Action]"
- Performance metrics: Duration for each step
- Total performance breakdown at end
- DEBUG level for validation details

---

## Data Flow Pipeline

### Complete Transformation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: CANVAS API FETCH                                        │
├─────────────────────────────────────────────────────────────────┤
│ Input:  courseId (String), quizId (String)                      │
│ Service: CanvasQuizFetcher                                      │
│ Action:  GET /api/v1/courses/{courseId}/quizzes/{quizId}        │
│ Output:  CanvasQuizDto {                                        │
│            id: 12345,                                           │
│            title: "Quiz 1",                                     │
│            description: "<p>Quiz description</p>",              │
│            questionCount: 10                                    │
│          }                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: CANVAS QUESTIONS FETCH                                  │
├─────────────────────────────────────────────────────────────────┤
│ Input:  courseId, quizId                                        │
│ Service: CanvasQuizFetcher                                      │
│ Action:  GET /api/v1/courses/{courseId}/quizzes/{quizId}/questions│
│ Output:  List<CanvasQuestionDto> [                             │
│            {                                                     │
│              id: 1,                                             │
│              questionText: "<p>What is 2+2?</p>",               │
│              questionType: "multiple_choice_question",          │
│              position: 1,                                       │
│              pointsPossible: 1.0,                               │
│              answers: [                                         │
│                { text: "3", weight: 0 },                        │
│                { text: "4", weight: 100 },  // Correct          │
│                { text: "5", weight: 0 }                         │
│              ],                                                 │
│              correctComments: "Well done!",                     │
│              incorrectComments: "Try again."                    │
│            },                                                   │
│            ...                                                  │
│          ]                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: CSV PARSING                                             │
├─────────────────────────────────────────────────────────────────┤
│ Input:  MultipartFile (CSV from Canvas)                         │
│ Service: CsvSubmissionParser                                    │
│ CSV Format:                                                     │
│   Student First Name, Student Last Name, Student ID,            │
│   #1 Student Response, #2 Student Response, ...                 │
│   John, Doe, 12345, A, B, C, ...                                │
│                                                                  │
│ Output:  List<StudentSubmission> [                             │
│            {                                                     │
│              firstName: "John",                                 │
│              lastName: "Doe",                                   │
│              studentId: "12345",                                │
│              responses: {                                       │
│                1 → "A",  // Question 1 answer                   │
│                2 → "B",  // Question 2 answer                   │
│                3 → "C"   // Question 3 answer                   │
│              }                                                   │
│            },                                                   │
│            ...                                                  │
│          ]                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: REPORT GENERATION (Business Logic)                      │
├─────────────────────────────────────────────────────────────────┤
│ Input:  CanvasQuizDto, List<CanvasQuestionDto>,                │
│         List<StudentSubmission>                                 │
│ Service: PrintReportGenerator                                   │
│                                                                  │
│ Algorithm:                                                       │
│   1. Sort questions by position                                 │
│   2. For each student:                                          │
│      For each question:                                         │
│        a. Get student answer from responses map                 │
│        b. Evaluate answer by question type                      │
│        c. Determine correctness                                 │
│        d. Build consolidated feedback                           │
│                                                                  │
│ Output:  PrintReport {                                          │
│            quizTitle: "Quiz 1",                                 │
│            studentReports: [                                    │
│              {                                                   │
│                student: StudentSubmission { ... },              │
│                questionResults: [                               │
│                  {                                              │
│                    question: CanvasQuestionDto { ... },         │
│                    studentAnswer: "A",                          │
│                    isCorrect: false,                            │
│                    correctAnswers: ["4"],                       │
│                    feedbackToShow: "<div>Try again.</div>"      │
│                  },                                             │
│                  ...                                            │
│                ]                                                │
│              },                                                 │
│              ...                                                │
│            ]                                                    │
│          }                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: VIEW MODEL MAPPING (View Optimization)                  │
├─────────────────────────────────────────────────────────────────┤
│ Input:  CanvasQuizDto, List<CanvasQuestionDto>,                │
│         List<StudentSubmission>, PrintReport                    │
│ Service: QuizPrintViewModelMapper                               │
│                                                                  │
│ Transformations:                                                │
│   - Flatten nested structures                                   │
│   - Strip HTML from text fields                                 │
│   - Assign option letters (A, B, C, D)                          │
│   - Compute visual markers (✓, ✗, ▲)                           │
│   - Determine answer status (CORRECT, INCORRECT, UNANSWERED)    │
│   - Pre-compute per-option booleans (isCorrect, isStudentAnswer)│
│                                                                  │
│ Output:  QuizPrintViewModel {                                   │
│            quizTitle: "Quiz 1",                                 │
│            studentCount: 1,                                     │
│            students: [                                          │
│              {                                                   │
│                studentName: "John Doe",                         │
│                studentId: "12345",                              │
│                incorrectQuestionNumbers: [1, 3],                │
│                questions: [                                     │
│                  {                                              │
│                    questionNumber: 1,                           │
│                    questionText: "What is 2+2?",  // HTML stripped│
│                    pointsPossible: 1.0,                         │
│                    questionType: "multiple_choice_question",    │
│                    studentAnswerText: "A",                      │
│                    isCorrect: false,                            │
│                    answerStatus: INCORRECT,                     │
│                    feedbackText: "<div>Try again.</div>",       │
│                    hasOptions: true,                            │
│                    options: [                                   │
│                      {                                          │
│                        optionLetter: "A",                       │
│                        optionText: "3",                         │
│                        isCorrect: false,                        │
│                        isStudentAnswer: true,                   │
│                        visualMarker: "✗",  // Incorrect + selected│
│                        commentText: null                        │
│                      },                                         │
│                      {                                          │
│                        optionLetter: "B",                       │
│                        optionText: "4",                         │
│                        isCorrect: true,                         │
│                        isStudentAnswer: false,                  │
│                        visualMarker: "▲",  // Correct + missed  │
│                        commentText: null                        │
│                      },                                         │
│                      {                                          │
│                        optionLetter: "C",                       │
│                        optionText: "5",                         │
│                        isCorrect: false,                        │
│                        isStudentAnswer: false,                  │
│                        visualMarker: "",  // No marker          │
│                        commentText: null                        │
│                      }                                          │
│                    ]                                            │
│                  },                                             │
│                  ...                                            │
│                ]                                                │
│              }                                                   │
│            ]                                                    │
│          }                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: TEMPLATE RENDERING                                      │
├─────────────────────────────────────────────────────────────────┤
│ Input:  QuizPrintViewModel (added to Spring Model)             │
│ Template: print-report-view.html or print-report-slip.html     │
│ Engine:  Thymeleaf                                              │
│                                                                  │
│ Template Variables:                                             │
│   ${quizzes} - List of QuizPrintViewModel                       │
│   ${studentCount} - Number of students                          │
│   ${student.questions} - List of QuestionView                   │
│   ${q.options} - List of OptionView                             │
│                                                                  │
│ Output:  HTML page ready for printing                           │
└─────────────────────────────────────────────────────────────────┘
```

### Typical Performance Metrics

Based on controller logging (`PrintReportController.java:165-166`):

| Step | Operation | Typical Duration |
|------|-----------|------------------|
| 1 | Canvas quiz fetch | 200-500ms |
| 2 | Canvas questions fetch | 300-800ms |
| 3 | CSV parsing | 50-100ms |
| 4 | Report generation | 100-300ms |
| 5 | ViewModel mapping | 50-150ms |
| **Total** | **End-to-end** | **1-2 seconds** |

---

## Key Algorithms

### 1. Question Sorting Algorithm
**Location**: `PrintReportGenerator.java:34-37`

```java
List<CanvasQuestionDto> sortedQuestions = questions.stream()
    .sorted(Comparator.comparing(
        q -> q.position() != null ? q.position() : 0))
    .toList();
```

**Purpose**: Ensure questions appear in correct order
**Null Handling**: Treat null position as 0
**Why**: Canvas API may return questions unordered or with null positions

### 2. Answer Evaluation Algorithm
**Location**: `PrintReportGenerator.java:107-140`

**High-Level Algorithm**:
```
function evaluateAnswer(question, studentAnswer, result):
    switch (question.questionType):
        case "multiple_choice_question", "true_false_question":
            evaluateMultipleChoice(question, studentAnswer, result)
        case "multiple_answers_question":
            evaluateMultipleAnswers(question, studentAnswer, result)
        case "multiple_dropdowns_question":
            evaluateMultipleDropdowns(question, studentAnswer, result)
        case "matching_question":
            evaluateMatching(question, studentAnswer, result)
        default:
            result.isCorrect = false
            result.feedbackToShow = "Question type not supported"

    buildFeedback(question, result)
```

### 3. Multiple Choice Evaluation
**Location**: `PrintReportGenerator.java:142-185`

**Detailed Algorithm**:
```
function evaluateMultipleChoice(question, studentAnswer, result):
    // Extract correct answer texts
    correctTexts = []
    for answer in question.answers():
        if answer.weight == 100:
            correctTexts.add(stripHtml(answer.text))

    result.correctAnswers = correctTexts

    isCorrect = false

    if studentAnswer is not null and not empty:
        // Try letter matching
        if studentAnswer.length == 1 AND studentAnswer[0] is uppercase:
            index = studentAnswer[0] - 'A'  // 'A' → 0, 'B' → 1
            if index >= 0 AND index < question.answers().size():
                selectedAnswer = question.answers().get(index)
                isCorrect = selectedAnswer.isCorrect()
        else:
            // Try text matching
            for correctText in correctTexts:
                if correctText equals studentAnswer (case-insensitive):
                    isCorrect = true
                    break

    result.isCorrect = isCorrect
```

### 4. Multiple Answers Evaluation
**Location**: `PrintReportGenerator.java:187-246`

**Detailed Algorithm**:
```
function evaluateMultipleAnswers(question, studentAnswer, result):
    // Extract correct answer texts
    correctTexts = extract correct answers from question
    result.correctAnswers = correctTexts

    if studentAnswer is null or empty:
        result.isCorrect = false
        return

    // Parse student answers (comma or semicolon separated)
    studentAnswers = studentAnswer.split("[,;]")
    studentList = []

    for ans in studentAnswers:
        trimmed = ans.trim()
        if not trimmed.isEmpty():
            // Convert letter to text if needed
            if trimmed.length == 1 AND trimmed[0] is uppercase:
                index = trimmed[0] - 'A'
                if index is valid:
                    answerText = stripHtml(question.answers().get(index).text)
                    studentList.add(answerText)
            else:
                studentList.add(trimmed)

    // Check if student selected EXACTLY the correct answers
    isCorrect = (studentList.size == correctTexts.size) AND
                (all studentList items are in correctTexts, case-insensitive)

    result.isCorrect = isCorrect
```

**Key Insight**: Requires exact match - selecting subset or superset is incorrect.

### 5. Feedback Consolidation Algorithm
**Location**: `PrintReportGenerator.java:292-333`

**Detailed Algorithm**:
```
function buildFeedback(question, result):
    feedback = StringBuilder()

    // 1. General feedback (shown to all)
    if question.neutralComments is not null and not empty:
        feedback.append("<div class='feedback-general'>")
        feedback.append(question.neutralComments)
        feedback.append("</div>")

    // 2. Correctness-specific feedback
    if result.isCorrect:
        if question.correctComments is not null and not empty:
            feedback.append("<div class='feedback-correct'>")
            feedback.append(question.correctComments)
            feedback.append("</div>")
    else:
        if question.incorrectComments is not null and not empty:
            feedback.append("<div class='feedback-incorrect'>")
            feedback.append(question.incorrectComments)
            feedback.append("</div>")

    // 3. Answer-specific feedback
    for answer in question.answers():
        if answer.comments is not null and not empty:
            answerText = stripHtml(answer.text)
            if result.studentAnswer contains answerText:
                feedback.append("<div class='feedback-answer-specific'>")
                feedback.append(answer.comments)
                feedback.append("</div>")

    result.feedbackToShow = feedback.toString()
```

**Feedback Priority**: General → Correctness → Answer-specific

### 6. Visual Marker Computation
**Location**: `QuizPrintViewModelMapper.java:253-263`

**Algorithm**:
```
function computeVisualMarker(isCorrect, isStudentAnswer, isQuestionCorrect):
    if isCorrect AND isStudentAnswer:
        return "✓"  // Correct answer, student selected it

    if NOT isCorrect AND isStudentAnswer:
        return "✗"  // Incorrect answer, student selected it

    if isCorrect AND NOT isStudentAnswer AND NOT isQuestionCorrect:
        return "▲"  // Correct answer missed (shown only when question wrong)

    return ""  // No marker for other cases
```

**Design Rationale**:
- Don't show `▲` when question is correct (reduces clutter)
- Only highlight what student did wrong or missed

### 7. Student Answer Matching
**Location**: `QuizPrintViewModelMapper.java:182-237`

**Algorithm by Question Type**:

```
function isStudentAnswerMatch(answer, studentAnswer, index, question):
    if studentAnswer is null or empty or "No answer":
        return false

    questionType = question.questionType
    optionText = stripHtml(answer.text)

    switch (questionType):
        case "multiple_choice_question", "true_false_question":
            // Try letter match
            if studentAnswer.length == 1 AND is uppercase:
                expectedLetter = 'A' + index
                return studentAnswer[0] == expectedLetter
            // Try text match
            return optionText equals studentAnswer (case-insensitive)

        case "multiple_answers_question":
            // Split by comma or semicolon
            studentAnswers = studentAnswer.split("[,;]")
            for ans in studentAnswers:
                trimmed = ans.trim()
                // Try letter match
                if trimmed.length == 1 AND is uppercase:
                    expectedLetter = 'A' + index
                    if trimmed[0] == expectedLetter:
                        return true
                // Try text match
                if optionText equals trimmed (case-insensitive):
                    return true
            return false

        case "multiple_dropdowns_question":
            return studentAnswer contains optionText

        case "matching_question":
            return studentAnswer contains optionText

        default:
            return optionText equals studentAnswer (case-insensitive)
```

### 8. Answer Status Determination
**Location**: `QuizPrintViewModelMapper.java:272-280`

**Algorithm**:
```
function determineAnswerStatus(studentAnswer, isCorrect):
    // Check if unanswered
    if studentAnswer is null OR empty OR equals "No answer":
        return UNANSWERED

    // If answered, return based on correctness
    return isCorrect ? CORRECT : INCORRECT
```

**Tri-State Logic**: `CORRECT` | `INCORRECT` | `UNANSWERED`

---

## Template Layer

### Template Files

**Location**: `src/main/resources/templates/`

| Template | Purpose | Route |
|----------|---------|-------|
| `print-report-upload.html` | Upload form | GET /print-report |
| `print-report-view.html` | Full report (all questions) | POST /print-report/generate?reportType=full |
| `print-report-slip.html` | Slip report (incorrect only) | POST /print-report/generate?reportType=slip |

### Template Variables

Available in Thymeleaf templates:

```html
<!-- Model Attributes -->
${quizzes}        - List<QuizPrintViewModel> (usually single item)
${studentCount}   - int

<!-- QuizPrintViewModel Structure -->
${quiz.quizTitle}
${quiz.studentCount}
${quiz.students}  - List<StudentQuizView>

<!-- StudentQuizView Structure -->
${student.studentName}
${student.studentId}
${student.questions}                    - List<QuestionView>
${student.incorrectQuestionNumbers}     - List<Integer>

<!-- QuestionView Structure -->
${q.questionNumber}
${q.questionText}
${q.pointsPossible}
${q.questionType}
${q.studentAnswerText}
${q.isCorrect}
${q.answerStatus}     - CORRECT, INCORRECT, UNANSWERED
${q.feedbackText}     - HTML feedback
${q.hasOptions}       - boolean
${q.options}          - List<OptionView>

<!-- OptionView Structure -->
${opt.optionLetter}     - "A", "B", "C", "D", etc.
${opt.optionText}
${opt.isCorrect}
${opt.isStudentAnswer}
${opt.visualMarker}     - "✓", "✗", "▲", or ""
${opt.commentText}
```

### Template Iteration Pattern

```html
<div th:each="quiz : ${quizzes}">
    <h1 th:text="${quiz.quizTitle}">Quiz Title</h1>

    <div th:each="student : ${quiz.students}" class="student-section">
        <h2 th:text="${student.studentName}">Student Name</h2>
        <p th:text="${student.studentId}">ID</p>

        <div th:each="q : ${student.questions}" class="question">
            <p th:text="|Q${q.questionNumber}: ${q.questionText}|">Question</p>

            <div th:if="${q.hasOptions}">
                <div th:each="opt : ${q.options}" class="option">
                    <span th:text="${opt.optionLetter}">A</span>
                    <span th:text="${opt.optionText}">Option text</span>
                    <span th:text="${opt.visualMarker}" class="marker">✓</span>
                </div>
            </div>

            <div th:utext="${q.feedbackText}">Feedback</div>
        </div>
    </div>
</div>
```

### CSS Classes for Styling

```css
.feedback-general          /* General feedback */
.feedback-correct          /* Feedback for correct answers */
.feedback-incorrect        /* Feedback for incorrect answers */
.feedback-answer-specific  /* Answer-specific feedback */
```

### Print Optimization

Templates use print-specific CSS:
- `@media print` rules for layout
- `page-break-after: always` for student separation
- `break-inside: avoid` for question blocks
- B&W-optimized (no color dependencies)
- Visual markers (✓, ✗, ▲) instead of color coding

---

## Configuration

### CanvasProperties

**Location**: `config/CanvasProperties.java`
**Annotation**: `@ConfigurationProperties(prefix = "app.canvas")`

```java
record CanvasProperties(
    String url,      // Canvas instance URL
    String token     // Canvas API access token
)
```

### Application Properties

**Location**: `src/main/resources/application.properties`

```properties
# Canvas API Configuration
app.canvas.url=https://canvas.instructure.com
app.canvas.token=YOUR_API_TOKEN_HERE

# Server
server.port=8080

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.qtihelper.demo=DEBUG
```

### Required Permissions

Canvas API token needs:
- Read access to courses
- Read access to quizzes
- Read access to quiz questions

---

## Technology Stack

### Backend Dependencies

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.5.8</version>
    </dependency>

    <!-- Thymeleaf Template Engine -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>

    <!-- Apache Commons CSV -->
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-csv</artifactId>
        <version>1.10.0</version>
    </dependency>

    <!-- Reactor Core (for RestClient) -->
    <dependency>
        <groupId>io.projectreactor</groupId>
        <artifactId>reactor-core</artifactId>
    </dependency>

    <!-- SLF4J + Logback (logging) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-logging</artifactId>
    </dependency>
</dependencies>
```

### Frontend Technologies

- **Thymeleaf**: Server-side template engine
- **Pure CSS**: No JavaScript frameworks
- **Google Fonts**: Noto Sans JP, Noto Serif JP
- **Print CSS**: `@media print` rules for A4 layout

### Build Tool

- **Maven**: Dependency management and build automation

### Java Version

- **Java 17+**: Required for record types and modern language features

---

## Summary

### Component Interaction Diagram

```
┌─────────────────┐
│     Browser     │
└────────┬────────┘
         │ POST (courseId, quizId, csvFile)
         ▼
┌──────────────────────────────────────┐
│    PrintReportController             │
│    - Validates inputs                │
│    - Orchestrates 4 services         │
│    - Handles errors                  │
│    - Logs performance                │
└────┬────────┬──────────┬─────────┬───┘
     │        │          │         │
     ▼        ▼          ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐
│ Canvas  │ │   CSV   │ │ Report  │ │   ViewModel      │
│ Quiz    │ │ Submit- │ │ Genera- │ │   Mapper         │
│ Fetcher │ │ Parser  │ │ tor     │ │                  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬─────────────┘
     │           │           │           │
     ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐
│ Canvas  │ │Student  │ │ Print   │ │ QuizPrint       │
│ DTOs    │ │Submis-  │ │ Report  │ │ ViewModel       │
│         │ │sion     │ │         │ │                 │
└─────────┘ └─────────┘ └─────────┘ └────┬────────────┘
                                          │
                                          ▼
                                    ┌──────────────┐
                                    │  Thymeleaf   │
                                    │  Template    │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ HTML Output  │
                                    └──────────────┘
```

### Key Design Decisions

1. **View Model Pattern**:
   - Separates business logic (`PrintReport`) from presentation (`QuizPrintViewModel`)
   - Pre-computes display values (letters, markers, booleans)
   - Simplifies template logic

2. **Immutable DTOs**:
   - Canvas data encapsulated in Java records
   - Thread-safe and prevents accidental modification

3. **Service Layer Separation**:
   - Each service has single responsibility
   - Enables independent testing
   - Clear dependency boundaries

4. **Null Safety**:
   - Defensive null checks throughout
   - Default values (position → 0, points → 0.0)
   - "No answer" placeholder for missing responses

5. **Performance Logging**:
   - Per-step timing for diagnosis
   - Structured logging for parsing
   - Total performance breakdown

6. **Error Handling**:
   - User-friendly messages
   - Specific handling for Canvas API errors
   - Full stack traces in logs

---

## Glossary

| Term | Definition |
|------|------------|
| **DTO** | Data Transfer Object - immutable record from Canvas API |
| **ViewModel** | View-optimized model for template rendering |
| **Business Model** | Domain model containing business logic data (`PrintReport`) |
| **Visual Marker** | Symbol indicating answer status (✓, ✗, ▲) |
| **Answer Status** | Tri-state enum: CORRECT, INCORRECT, UNANSWERED |
| **Question Type** | Canvas question category (multiple_choice, true_false, etc.) |
| **Weight** | Canvas answer correctness indicator (100 = correct, 0 = incorrect) |
| **Feedback Consolidation** | Merging general, correctness, and answer-specific feedback |
| **Strip HTML** | Removing HTML tags to extract plain text |

---

## Line Reference Index

| Component | Key Method | Line Range |
|-----------|-----------|------------|
| PrintReportController | generateReport() | 57-202 |
| PrintReportGenerator | generateReport() | 22-105 |
| PrintReportGenerator | evaluateAnswer() | 107-140 |
| PrintReportGenerator | evaluateMultipleChoice() | 142-185 |
| PrintReportGenerator | evaluateMultipleAnswers() | 187-246 |
| PrintReportGenerator | buildFeedback() | 292-333 |
| QuizPrintViewModelMapper | mapToViewModel() | 40-60 |
| QuizPrintViewModelMapper | mapStudent() | 65-95 |
| QuizPrintViewModelMapper | mapQuestion() | 100-134 |
| QuizPrintViewModelMapper | mapOptions() | 139-171 |
| QuizPrintViewModelMapper | isStudentAnswerMatch() | 182-237 |
| QuizPrintViewModelMapper | computeVisualMarker() | 253-263 |

---

**End of Architecture Documentation**
