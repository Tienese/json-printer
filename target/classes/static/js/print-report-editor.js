/**
 * Print Report Editor - Enables inline editing of student quiz reports
 * Allows editing student names, answers, questions, and feedback before printing
 */

let isEditMode = false;
let originalData = null; // Store initial state for potential revert

/**
 * Toggle between view and edit modes
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    const body = document.body;
    const toggleBtn = document.getElementById('editToggle');
    const saveBtn = document.getElementById('saveEdits');

    if (isEditMode) {
        // Enable edit mode
        body.classList.add('edit-mode');
        toggleBtn.textContent = '👁️ View Mode';
        saveBtn.style.display = 'inline-block';

        // Make text fields contenteditable
        document.querySelectorAll('.editable-field').forEach(field => {
            field.contentEditable = true;
            field.setAttribute('spellcheck', 'false');
        });

        // Store original state on first edit
        if (!originalData) {
            originalData = collectReportData();
        }

        console.log('Edit mode enabled');
    } else {
        // Disable edit mode
        body.classList.remove('edit-mode');
        toggleBtn.textContent = '📝 Edit Report';
        saveBtn.style.display = 'none';

        // Disable contenteditable
        document.querySelectorAll('.editable-field').forEach(field => {
            field.contentEditable = false;
        });

        console.log('View mode enabled');
    }
}

/**
 * Collect all edited data from the report
 * Returns structured data matching PrintReportEditDto format
 */
function collectReportData() {
    const data = {
        students: []
    };

    document.querySelectorAll('.student-wrapper').forEach((studentDiv, studentIdx) => {
        const student = {
            studentName: '',
            studentId: '',
            questions: []
        };

        // Collect student info
        const nameField = studentDiv.querySelector('[data-field="studentName"]');
        const idField = studentDiv.querySelector('[data-field="studentId"]');

        if (nameField) student.studentName = nameField.textContent.trim();
        if (idField) student.studentId = idField.textContent.trim();

        // Collect questions
        studentDiv.querySelectorAll('.question-wrapper').forEach((questionDiv, qIdx) => {
            const question = {
                questionText: '',
                options: [],
                feedback: '',
                studentAnswerText: ''
            };

            // Question text
            const questionTextField = questionDiv.querySelector('[data-field="questionText"]');
            if (questionTextField) {
                question.questionText = questionTextField.textContent.trim();
            }

            // Collect options
            questionDiv.querySelectorAll('.option-item').forEach((optionDiv, optIdx) => {
                const checkbox = optionDiv.querySelector('.option-checkbox');
                const optionTextField = optionDiv.querySelector('[data-field="optionText"]');
                const commentField = optionDiv.querySelector('[data-field="optionComment"]');

                const option = {
                    optionText: optionTextField ? optionTextField.textContent.trim() : '',
                    isSelected: checkbox ? checkbox.checked : false,
                    comment: commentField ? commentField.textContent.trim() : ''
                };

                question.options.push(option);
            });

            // Student answer text (for essay questions)
            const answerTextField = questionDiv.querySelector('[data-field="studentAnswerText"]');
            if (answerTextField) {
                question.studentAnswerText = answerTextField.textContent.trim();
            }

            // Feedback
            const feedbackField = questionDiv.querySelector('[data-field="feedbackText"]');
            if (feedbackField) {
                question.feedback = feedbackField.textContent.trim();
            }

            student.questions.push(question);
        });

        data.students.push(student);
    });

    return data;
}

/**
 * Save edited data and regenerate report
 */
async function saveEdits() {
    const editedData = collectReportData();

    console.log('Saving edits...', editedData);

    // Show loading indicator
    const saveBtn = document.getElementById('saveEdits');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Saving...';

    try {
        // Send edited data to server
        const response = await fetch('/print-report/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedData)
        });

        if (response.ok) {
            // Replace current page with updated HTML
            const newHtml = await response.text();
            document.open();
            document.write(newHtml);
            document.close();

            console.log('Changes saved successfully');
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            alert('✗ Failed to save changes: ' + response.statusText);
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('✗ Error saving changes: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

/**
 * Handle checkbox changes in edit mode - update visual box
 */
document.addEventListener('change', (event) => {
    if (event.target.classList.contains('option-checkbox')) {
        // Update visual box to reflect checkbox state
        const checkbox = event.target;
        const box = checkbox.nextElementSibling;

        if (box && box.classList.contains('box')) {
            if (checkbox.checked) {
                box.classList.add('picked');
            } else {
                box.classList.remove('picked');
            }
        }

        console.log('Option selection changed');
    }
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (event) => {
    // Ctrl+E or Cmd+E: Toggle edit mode
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        toggleEditMode();
    }

    // Ctrl+S or Cmd+S: Save changes (when in edit mode)
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && isEditMode) {
        event.preventDefault();
        saveEdits();
    }
});

console.log('Print Report Editor loaded - Press Ctrl+E to toggle edit mode');
