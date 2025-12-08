# Print Report Feature - Testing & Validation Checklist

## 🔧 Pre-Installation Checklist

- [ ] Spring Boot version is 3.x+
- [ ] Java 21+ is installed
- [ ] Canvas API token is configured in `application.properties`
- [ ] Canvas API token has quiz read permissions
- [ ] Maven is installed and configured

---

## 📦 Installation Checklist

### Files Copied
- [ ] `CanvasQuizDto.java` → `dto/canvas/`
- [ ] `CanvasQuestionDto.java` → `dto/canvas/`
- [ ] `CanvasAnswerDto.java` → `dto/canvas/`
- [ ] `CanvasMatchDto.java` → `dto/canvas/`
- [ ] `StudentSubmission.java` → `model/`
- [ ] `PrintReport.java` → `model/`
- [ ] `CsvSubmissionParser.java` → `service/`
- [ ] `CanvasQuizFetcher.java` → `service/`
- [ ] `PrintReportGenerator.java` → `service/`
- [ ] `PrintReportController.java` → `controller/`
- [ ] `print-report-upload.html` → `templates/`
- [ ] `print-report-view.html` → `templates/`

### Configuration
- [ ] Added `commons-csv` dependency to `pom.xml`
- [ ] Run `mvn clean install` successfully
- [ ] No compilation errors
- [ ] Application starts without errors

---

## 🧪 Functional Testing

### Basic Flow
1. **Access Upload Form**
   - [ ] Navigate to `/print-report`
   - [ ] Form displays correctly
   - [ ] All fields are present (Course ID, Quiz ID, CSV upload)

2. **Input Validation**
   - [ ] Submit without Course ID → Shows error
   - [ ] Submit without Quiz ID → Shows error
   - [ ] Submit without CSV file → Shows error
   - [ ] Submit with invalid CSV → Shows appropriate error

3. **Canvas Integration**
   - [ ] Valid Course ID + Quiz ID → Fetches quiz successfully
   - [ ] Invalid Course ID → Shows error message
   - [ ] Invalid Quiz ID → Shows error message
   - [ ] No questions in quiz → Shows error message

4. **CSV Parsing**
   - [ ] Valid CSV → Parses student data correctly
   - [ ] Check logs for parsed student count
   - [ ] Check logs for response count per student

5. **Report Generation**
   - [ ] Report displays for all students in CSV
   - [ ] Each student has separate section
   - [ ] All questions are displayed in order
   - [ ] Student answers are shown correctly

---

## ✅ Question Type Testing

Test with a quiz containing all question types:

### Multiple Choice (MC)
- [ ] Correct answer shows ✓ Correct
- [ ] Incorrect answer shows ✗ Incorrect
- [ ] Correct answer is displayed when incorrect
- [ ] Feedback displays appropriately

### True/False (TF)
- [ ] True answer evaluates correctly
- [ ] False answer evaluates correctly
- [ ] Feedback displays

### Multiple Answers (MA)
- [ ] All correct selections → ✓ Correct
- [ ] Missing correct selection → ✗ Incorrect
- [ ] Extra incorrect selection → ✗ Incorrect
- [ ] Correct answers list shows all options

### Multiple Dropdowns (DD)
- [ ] All dropdowns correct → ✓ Correct
- [ ] Any dropdown wrong → ✗ Incorrect
- [ ] Feedback per blank displays

### Matching (MT)
- [ ] All pairs correct → ✓ Correct
- [ ] Any pair wrong → ✗ Incorrect
- [ ] Shows matched pairs

---

## 🖨️ Print Testing

### Screen Display
- [ ] Report renders correctly in browser
- [ ] "Print Report" button is visible
- [ ] "Back" button works
- [ ] Navigation controls don't overlap content

### Print Preview
- [ ] Open print preview (Ctrl+P / Cmd+P)
- [ ] Page size is A4
- [ ] Margins are 1.72cm (verify in print settings)
- [ ] Student sections break across pages appropriately
- [ ] No content is cut off

### Print Layout
- [ ] Student headers are bold and clear
- [ ] Question numbers are sequential
- [ ] Answer indicators (✓/✗) are visible
- [ ] Feedback sections are readable
- [ ] Page breaks occur between students

### Black & White Print
- [ ] Print in B&W mode
- [ ] Correct/Incorrect indicators are distinguishable
- [ ] All text is readable
- [ ] No color-dependent information

---

## 📊 Data Accuracy Testing

### Test Case 1: Single Student, 5 Questions
- [ ] All 5 questions display
- [ ] Student info is correct
- [ ] Answers match CSV
- [ ] Correctness evaluation matches manual check

### Test Case 2: Multiple Students (3+)
- [ ] Each student has own section
- [ ] Page breaks between students
- [ ] No data mixing between students
- [ ] All students' names appear correctly

### Test Case 3: Mixed Question Types
- [ ] MC question evaluates correctly
- [ ] MA question evaluates correctly
- [ ] TF question evaluates correctly
- [ ] DD question evaluates correctly
- [ ] MT question evaluates correctly

### Test Case 4: Feedback Display
- [ ] General feedback appears for all
- [ ] Correct feedback shows for correct answers
- [ ] Incorrect feedback shows for incorrect answers
- [ ] Answer-specific feedback displays when relevant

---

## 🐛 Error Scenario Testing

### Canvas API Errors
- [ ] Wrong API token → Error message displayed
- [ ] Network error → Graceful error handling
- [ ] Rate limit → Appropriate message
- [ ] Invalid course/quiz ID → Clear error

### CSV Format Errors
- [ ] Wrong file type → Error message
- [ ] Malformed CSV → Error with details
- [ ] Empty CSV → Error message
- [ ] Missing required columns → Error message

### Edge Cases
- [ ] Quiz with 0 questions → Error
- [ ] CSV with 0 students → Error
- [ ] Very long quiz (30+ questions) → Handles correctly
- [ ] Very long student name → Displays without breaking
- [ ] Special characters in answers → Displays correctly
- [ ] HTML in question text → Renders safely

---

## 🔍 Code Quality Checks

### Logging
- [ ] Info logs for major steps
- [ ] Error logs with stack traces
- [ ] Debug logs for data parsing
- [ ] No sensitive data in logs (tokens, etc.)

### Exception Handling
- [ ] All exceptions caught appropriately
- [ ] User-friendly error messages
- [ ] No stack traces shown to user
- [ ] Errors logged for debugging

### Performance
- [ ] 10 students → Report loads in < 5 seconds
- [ ] 50 students → Report loads in < 15 seconds
- [ ] No memory leaks
- [ ] CSV parsing is efficient

---

## 📱 Browser Compatibility

Test in multiple browsers:

- [ ] **Chrome** - Display & Print
- [ ] **Firefox** - Display & Print
- [ ] **Safari** - Display & Print
- [ ] **Edge** - Display & Print

---

## 🎯 User Acceptance Testing

### Ease of Use
- [ ] Instructions are clear
- [ ] Form is intuitive
- [ ] Error messages are helpful
- [ ] Report is easy to read

### Practical Use
- [ ] Teacher can grade from printout
- [ ] Feedback is actionable for students
- [ ] Layout saves paper (compact but readable)
- [ ] Information is complete

---

## 📋 Production Readiness

### Security
- [ ] No SQL injection vectors
- [ ] File upload is safe (CSV only)
- [ ] Canvas token not exposed
- [ ] CSRF protection enabled (Spring default)

### Documentation
- [ ] README is clear
- [ ] Installation guide is complete
- [ ] Architecture diagram is accurate
- [ ] Code comments are adequate

### Maintenance
- [ ] Logging is sufficient for debugging
- [ ] Error messages help identify issues
- [ ] Code is readable and maintainable
- [ ] Dependencies are up to date

---

## ✨ Optional Enhancements to Test

If implemented:
- [ ] Score calculation displays correctly
- [ ] Statistics summary appears
- [ ] PDF export works
- [ ] Caching improves performance
- [ ] Batch processing handles multiple quizzes

---

## 📝 Sign-Off

### Tested By
- **Name:** ___________________
- **Date:** ___________________

### Test Results
- [ ] All critical tests pass
- [ ] No blocking issues
- [ ] Ready for production

### Notes
```
[Add any observations, issues, or recommendations here]
```

---

## 🆘 If Tests Fail

### Common Issues & Solutions

1. **"Failed to fetch quiz"**
   - Check Canvas API token validity
   - Verify course/quiz IDs are correct
   - Check network connectivity

2. **"CSV parsing failed"**
   - Verify CSV format matches Canvas export
   - Check for special characters
   - Try re-exporting from Canvas

3. **"Incorrect evaluation"**
   - Check answer format in CSV vs. expected format
   - Review logs for comparison details
   - Verify question type is supported

4. **Print layout issues**
   - Clear browser cache
   - Try different browser
   - Check print preview settings

5. **Page breaks incorrect**
   - This may be browser-dependent
   - Test with Chrome/Firefox for best results
   - Adjust CSS if needed

---

**Remember:** Test with real quiz data before production use!
