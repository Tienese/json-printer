let quizData = {
    title: "",
    description: "",
    questions: []
};

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
    
    // Toggle Logic
    const toggle = document.getElementById('viewToggle');
    toggle.addEventListener('change', (e) => {
        if(e.target.checked) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    });
});

// --- Notifications (Bootstrap Alerts) ---
function showNotification(message, type = 'success') {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    
    // Bootstrap alert classes
    notif.className = `alert alert-${type === 'success' ? 'success' : 'danger'} d-block`;
    
    setTimeout(() => {
        notif.classList.remove('d-block');
        notif.classList.add('d-none');
    }, 4000);
}

// --- API Calls (Unchanged logic, just cleaned up) ---
async function loadQuiz() {
    try {
        const response = await fetch('/api/quiz');
        const result = await response.json();
        if (result.success) {
            quizData = result.data;
            renderQuiz();
            showNotification('Loaded successfully', 'success');
        } else {
            showNotification(result.message || 'Failed to load', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function saveQuiz() {
    collectQuizData();
    try {
        const response = await fetch('/api/quiz/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData)
        });
        const result = await response.json();
        showNotification(result.message, result.success ? 'success' : 'error');
    } catch (error) {
        showNotification('Error saving: ' + error.message, 'error');
    }
}

async function sendToCanvas() {
    const courseId = document.getElementById('courseId').value.trim();
    if (!courseId) {
        showNotification('Course ID required', 'error');
        return;
    }
    collectQuizData();
    try {
        const response = await fetch('/api/quiz/canvas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, quizData })
        });
        const result = await response.json();
        showNotification(result.message, result.success ? 'success' : 'error');
    } catch (error) {
        showNotification('Canvas Error: ' + error.message, 'error');
    }
}

// --- Data Collection ---
function collectQuizData() {
    quizData.title = document.getElementById('quizTitle').value;
    quizData.description = document.getElementById('quizDescription').value;
    
    const questionCards = document.querySelectorAll('.question-card');
    quizData.questions = [];
    
    questionCards.forEach((card) => {
        const question = {
            type: card.querySelector('[data-field="type"]').value,
            title: card.querySelector('[data-field="title"]').value,
            prompt: card.querySelector('[data-field="prompt"]').value,
            points: parseFloat(card.querySelector('[data-field="points"]').value) || 1.0,
            generalFeedback: card.querySelector('[data-field="generalFeedback"]').value || null,
            correctFeedback: card.querySelector('[data-field="correctFeedback"]').value || null,
            incorrectFeedback: card.querySelector('[data-field="incorrectFeedback"]').value || null,
            answers: []
        };
        
        const answerItems = card.querySelectorAll('.answer-item');
        answerItems.forEach(item => {
            question.answers.push({
                text: item.querySelector('[data-field="answer-text"]').value,
                correct: item.querySelector('[data-field="answer-correct"]').checked,
                feedback: item.querySelector('[data-field="answer-feedback"]').value || null
            });
        });
        
        quizData.questions.push(question);
    });
}

// --- Rendering (Bootstrap Refactor) ---
function renderQuiz() {
    document.getElementById('quizTitle').value = quizData.title || '';
    document.getElementById('quizDescription').value = quizData.description || '';
    
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    if (quizData.questions && quizData.questions.length > 0) {
        quizData.questions.forEach((question, index) => {
            container.appendChild(createQuestionCard(question, index));
        });
    }
}

function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'card question-card'; // Bootstrap card class
    card.dataset.index = index;
    
    const questionTypes = ['MC', 'MA', 'TF', 'MT', 'DD'];
    const typeOptions = questionTypes.map(type => 
        `<option value="${type}" ${question.type === type ? 'selected' : ''}>${type}</option>`
    ).join('');
    
    // Using ASCII symbols: &#215; (multiplication X) for delete, &#43; for plus
    card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center" 
             style="cursor: pointer;" onclick="toggleQuestion(${index})">
            <span>Q${index + 1}: ${escapeHtml(question.title || 'Untitled')}</span>
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="event.stopPropagation(); removeQuestion(${index})">
                Remove [x]
            </button>
        </div>
        <div class="card-body collapse show question-body-collapse">
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label fw-bold">Type</label>
                    <select class="form-select" data-field="type">${typeOptions}</select>
                </div>
                <div class="col-md-2">
                    <label class="form-label fw-bold">Points</label>
                    <input type="number" class="form-control" data-field="points" 
                           value="${question.points || 1.0}" step="0.5">
                </div>
                <div class="col-md-7">
                    <label class="form-label fw-bold">Title</label>
                    <input type="text" class="form-control" data-field="title" 
                           value="${escapeHtml(question.title || '')}">
                </div>
            </div>
            
            <div class="mt-3">
                <label class="form-label fw-bold">Prompt / Question Text</label>
                <textarea class="form-control" data-field="prompt" rows="3">${escapeHtml(question.prompt || '')}</textarea>
            </div>
            
            <div class="mt-4 p-3 bg-light border">
                <h6 class="fw-bold border-bottom pb-2">Feedback</h6>
                <div class="row g-2">
                    <div class="col-md-4">
                        <small>General</small>
                        <textarea class="form-control" data-field="generalFeedback" rows="2">${escapeHtml(question.generalFeedback || '')}</textarea>
                    </div>
                    <div class="col-md-4">
                        <small>Correct</small>
                        <textarea class="form-control" data-field="correctFeedback" rows="2">${escapeHtml(question.correctFeedback || '')}</textarea>
                    </div>
                    <div class="col-md-4">
                        <small>Incorrect</small>
                        <textarea class="form-control" data-field="incorrectFeedback" rows="2">${escapeHtml(question.incorrectFeedback || '')}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <label class="form-label fw-bold">Answers</label>
                <div class="answer-list" data-question-index="${index}">
                    ${renderAnswers(question.answers || [], index)}
                </div>
                <button class="btn btn-sm btn-outline-dark mt-2" onclick="addAnswer(${index})">
                    &#43; Add Answer
                </button>
            </div>
        </div>
    `;
    return card;
}

function renderAnswers(answers, questionIndex) {
    if (!answers || answers.length === 0) {
        return '<div class="text-muted fst-italic py-2">No answers yet.</div>';
    }
    
    return answers.map((answer, answerIndex) => `
        <div class="answer-item input-group mb-2">
            <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" 
                       data-field="answer-correct" ${answer.correct ? 'checked' : ''} 
                       aria-label="Is correct answer">
            </div>
            <input type="text" class="form-control" data-field="answer-text" 
                   value="${escapeHtml(answer.text || '')}" placeholder="Answer Text">
            <input type="text" class="form-control" data-field="answer-feedback" 
                   value="${escapeHtml(answer.feedback || '')}" placeholder="Feedback (Optional)">
            <button class="btn btn-outline-danger" onclick="removeAnswer(${questionIndex}, ${answerIndex})">
                &#215;
            </button>
        </div>
    `).join('');
}

function toggleQuestion(index) {
    // We use Bootstrap's collapse class toggle manually or via logic
    const cardBody = document.querySelector(`[data-index="${index}"] .question-body-collapse`);
    cardBody.classList.toggle('show');
    // 'show' is the Bootstrap class to make content visible. Removing it hides it.
}

function addQuestion() {
    quizData.questions.push({
        type: 'MC', title: 'New Question', prompt: '', points: 1.0, answers: []
    });
    renderQuiz();
}

function removeQuestion(index) {
    if (confirm('Delete Question ' + (index+1) + '?')) {
        quizData.questions.splice(index, 1);
        renderQuiz();
    }
}

function addAnswer(qIdx) {
    collectQuizData(); // sync state first
    if (!quizData.questions[qIdx].answers) quizData.questions[qIdx].answers = [];
    quizData.questions[qIdx].answers.push({ text: '', correct: false });
    
    // Re-render only answers to avoid losing focus if possible, 
    // but here we just re-render list for simplicity
    const card = document.querySelectorAll('.question-card')[qIdx];
    const list = card.querySelector('.answer-list');
    list.innerHTML = renderAnswers(quizData.questions[qIdx].answers, qIdx);
}

function removeAnswer(qIdx, aIdx) {
    collectQuizData();
    quizData.questions[qIdx].answers.splice(aIdx, 1);
    const card = document.querySelectorAll('.question-card')[qIdx];
    const list = card.querySelector('.answer-list');
    list.innerHTML = renderAnswers(quizData.questions[qIdx].answers, qIdx);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}