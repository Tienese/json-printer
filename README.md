# Print Report Feature - Quick Start

## 📋 What This Does

Generates printable student reports that combine:
- Canvas quiz structure (from API)
- Student responses (from CSV export)
- Correct/incorrect indicators
- Comprehensive feedback

**Output:** A4-sized, B&W-optimized HTML page ready for printing

---

## 🚀 Quick Installation

### Option 1: Automatic Installation (Recommended)

```bash
chmod +x install-print-report.sh
./install-print-report.sh
```

Then add the dependency to `pom.xml` (see `pom-dependency-snippet.xml`).

### Option 2: Manual Installation

1. **Copy Java files** to their respective packages:
   - `dto/canvas/*.java` → `src/main/java/com/qtihelper/demo/dto/canvas/`
   - `model/*.java` → `src/main/java/com/qtihelper/demo/model/`
   - `service/*.java` → `src/main/java/com/qtihelper/demo/service/`
   - `controller/*.java` → `src/main/java/com/qtihelper/demo/controller/`

2. **Copy HTML templates** to:
   - `print-report-*.html` → `src/main/resources/templates/`

3. **Add Maven dependency** (from `pom-dependency-snippet.xml`):
   ```xml
   <dependency>
       <groupId>org.apache.commons</groupId>
       <artifactId>commons-csv</artifactId>
       <version>1.10.0</version>
   </dependency>
   ```

4. **(Optional) Add navigation link** to `index.html` (see `index-html-update.html`)

---

## 📝 Usage

### Step 1: Export from Canvas
1. Canvas → Quiz → **Student Analysis**
2. Click **"Download All Student Responses"**
3. Save the CSV file

### Step 2: Generate Report
1. Go to `http://localhost:8080/print-report`
2. Enter **Course ID** (from Canvas URL)
3. Enter **Quiz ID** (from Canvas URL)
4. Upload the CSV file
5. Click **Generate**

### Step 3: Print
1. Review the report
2. Click **Print Report** button
3. Select B&W printing for cost savings
4. Print!

---

## 📦 Files Included

### Java Source Files (11 files)
- **DTOs:** `CanvasQuizDto`, `CanvasQuestionDto`, `CanvasAnswerDto`, `CanvasMatchDto`
- **Models:** `StudentSubmission`, `PrintReport`
- **Services:** `CsvSubmissionParser`, `CanvasQuizFetcher`, `PrintReportGenerator`
- **Controller:** `PrintReportController`

### Templates (2 files)
- `print-report-upload.html` - Upload form
- `print-report-view.html` - Printable report

### Documentation & Scripts
- `IMPLEMENTATION_GUIDE.md` - Detailed technical documentation
- `install-print-report.sh` - Automated installation script
- `pom-dependency-snippet.xml` - Maven dependency
- `index-html-update.html` - Navigation link snippet
- `README.md` - This file

---

## 🎯 Features

✅ **Automatic Correctness Evaluation**
- Multiple Choice, True/False
- Multiple Answers
- Multiple Dropdowns
- Matching Questions

✅ **Comprehensive Feedback Display**
- General feedback
- Correct/Incorrect specific feedback
- Answer-specific feedback

✅ **Print-Optimized**
- A4 page size with 1.72cm margins
- Page breaks between students
- Black & white friendly
- Space-efficient layout

✅ **Multi-Student Support**
- Process entire class at once
- Automatic pagination
- Clear student identification

---

## 🔧 Configuration

Your Canvas API credentials should already be configured in `application.properties`:

```properties
app.canvas.url=https://your-canvas-instance.com
app.canvas.token=your_api_token_here
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch quiz" | Check Canvas API token |
| "No questions found" | Ensure quiz has published questions |
| CSV parsing errors | Verify CSV format matches Canvas export |
| Incorrect evaluation | Check logs for answer format comparison |

---

## 📖 Documentation

For detailed technical documentation, see **`IMPLEMENTATION_GUIDE.md`**

---

## 🎓 Example Workflow

```
Canvas CSV Export
     ↓
Upload to /print-report
     ↓
System fetches quiz from Canvas API
     ↓
System parses student responses
     ↓
System merges data & evaluates
     ↓
Printable HTML report generated
     ↓
Print for distribution!
```

---

## 📞 Support

- Review logs for detailed error messages
- Check Canvas API documentation: https://canvas.instructure.com/doc/api/
- Verify Canvas API token has correct permissions

---

**Ready to use!** 🎉

After installation, visit: `http://localhost:8080/print-report`
