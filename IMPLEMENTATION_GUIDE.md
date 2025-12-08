# Print Report Feature - Implementation Guide

## Overview
This feature generates printable HTML reports that merge Canvas quiz data with student responses from CSV files.

## Files Created

### 1. DTOs (Canvas API Response Models)
**Location:** `src/main/java/com/qtihelper/demo/dto/canvas/`

- `CanvasQuizDto.java` - Quiz metadata
- `CanvasQuestionDto.java` - Question structure
- `CanvasAnswerDto.java` - Answer options
- `CanvasMatchDto.java` - Matching question pairs

### 2. Models
**Location:** `src/main/java/com/qtihelper/demo/model/`

- `StudentSubmission.java` - Parsed CSV student data
- `PrintReport.java` - Merged report data structure

### 3. Services
**Location:** `src/main/java/com/qtihelper/demo/service/`

- `CsvSubmissionParser.java` - Parses Canvas CSV exports
- `CanvasQuizFetcher.java` - Fetches quiz data from Canvas API
- `PrintReportGenerator.java` - Merges quiz + student data, evaluates correctness

### 4. Controller
**Location:** `src/main/java/com/qtihelper/demo/controller/`

- `PrintReportController.java` - Endpoints: `/print-report` (form), `/print-report/generate` (process)

### 5. Templates
**Location:** `src/main/resources/templates/`

- `print-report-upload.html` - Upload form for CSV + Canvas IDs
- `print-report-view.html` - Printable report view (A4, 1.72cm margins)

---

## Installation Steps

### Step 1: Add Maven Dependency
Add Apache Commons CSV to your `pom.xml`:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.10.0</version>
</dependency>
```

### Step 2: Copy Java Files

```bash
# DTOs
cp /home/claude/CanvasQuizDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasQuestionDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasAnswerDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasMatchDto.java src/main/java/com/qtihelper/demo/dto/canvas/

# Models
cp /home/claude/StudentSubmission.java src/main/java/com/qtihelper/demo/model/
cp /home/claude/PrintReport.java src/main/java/com/qtihelper/demo/model/

# Services
cp /home/claude/CsvSubmissionParser.java src/main/java/com/qtihelper/demo/service/
cp /home/claude/CanvasQuizFetcher.java src/main/java/com/qtihelper/demo/service/
cp /home/claude/PrintReportGenerator.java src/main/java/com/qtihelper/demo/service/

# Controller
cp /home/claude/PrintReportController.java src/main/java/com/qtihelper/demo/controller/

# Templates
cp /home/claude/print-report-upload.html src/main/resources/templates/
cp /home/claude/print-report-view.html src/main/resources/templates/
```

### Step 3: Add Navigation Link
Update `src/main/resources/templates/index.html` to add a link to the print report feature:

```html
<!-- Add this in the navigation section -->
<div class="mb-4">
    <a href="/print-report" class="btn btn-outline-dark">📄 Generate Print Report</a>
</div>
```

---

## Usage Flow

### 1. Export CSV from Canvas
1. Go to Canvas → Quizzes → Select Quiz
2. Click "Student Analysis"
3. Click "Download All Student Responses"
4. Save the CSV file

### 2. Generate Report
1. Navigate to `/print-report` in your application
2. Enter **Course ID** (from Canvas URL: `/courses/{courseId}/`)
3. Enter **Quiz ID** (from Canvas URL: `/quizzes/{quizId}`)
4. Upload the CSV file
5. Click "Generate Print Report"

### 3. Print
1. Review the generated report in your browser
2. Click the "🖨️ Print Report" button
3. Select printer and settings (use B&W for cost savings)
4. Print!

---

## Technical Details

### Canvas API Endpoints Used
- `GET /api/v1/courses/{courseId}/quizzes/{quizId}` - Quiz metadata
- `GET /api/v1/courses/{courseId}/quizzes/{quizId}/questions` - Question list

### CSV Format Expected
- Header row with: `Quiz Name`, `Student First Name`, `Student Last Name`, `Student ID`, `#1 Student Response`, `#2 Student Response`, etc.
- Each row represents one student
- Question numbers map to Canvas question positions

### Print Optimization
- **Page Size:** A4 (21cm × 29.7cm)
- **Margins:** 1.72cm on all sides
- **Page Breaks:** Automatic between students
- **Font:** Times New Roman, 11pt
- **Color:** Optimized for B&W printing

### Question Type Support
The system evaluates correctness for:
- Multiple Choice (MC)
- True/False (TF)
- Multiple Answers (MA)
- Multiple Dropdowns (DD)
- Matching (MT)

### Feedback Display
For each question, the report shows:
1. **General/Neutral Feedback** (shown to all)
2. **Correct/Incorrect Feedback** (based on student answer)
3. **Answer-Specific Feedback** (if student selected that option)

---

## Troubleshooting

### Issue: "Failed to fetch quiz from Canvas"
**Solution:** Check your Canvas API token in `application.properties`

### Issue: "No questions found"
**Solution:** Ensure the quiz has published questions

### Issue: CSV parsing errors
**Solution:** Verify CSV format matches Canvas export format

### Issue: Correctness evaluation wrong
**Solution:** CSV answer format might differ - check logs for student answer vs. correct answer comparison

---

## Future Enhancements

1. **Score Calculation** - Add total score per student
2. **Statistics** - Class average, question difficulty analysis
3. **Export Options** - PDF generation, individual student PDFs
4. **Caching** - Cache Canvas quiz data to reduce API calls
5. **Batch Processing** - Handle multiple quizzes at once

---

## Support

For issues or questions:
1. Check application logs for detailed error messages
2. Verify Canvas API permissions
3. Ensure CSV format matches expected structure
4. Review Canvas API documentation: https://canvas.instructure.com/doc/api/

---

## License
Part of QTI Helper application - follows same license as main project
