let quizData = {
    title: "",
    description: "",
    questions: []
};

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
    
    // Toggle Logic (Compact Mode)
    const toggle = document.getElementById('viewToggle');
    if(toggle) {
        toggle.addEventListener('change', (e) => {
            if(e.target.checked) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }
        });
    }
});

// --- Notifications ---
function showNotification(message, type = 'success') {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = `alert alert-${type === 'success' ? 'success' : 'danger'} d-block`;
    setTimeout(() => {
        notif.classList.remove('d-block');
        notif.classList.add('d-none');
    }, 4000);
}

// --- API Calls ---
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
        const type = card.querySelector('[data-field="type"]').value;
        
        const question = {
            type: type,
            title: card.querySelector('[data-field="title"]').value,
            prompt: card.querySelector('[data-field="prompt"]').value,
            points: parseFloat(card.querySelector('[data-field="points"]').value) || 1.0,
            generalFeedback: card.querySelector('[data-field="generalFeedback"]').value || null,
            correctFeedback: card.querySelector('[data-field="correctFeedback"]').value || null,
            incorrectFeedback: card.querySelector('[data-field="incorrectFeedback"]').value || null,
            answers: [],
            matchingPairs: [],
            matchingDistractors: []
        };
        
        // Data Collection Strategy based on Type
        if (type === 'MT') {
            // Collect Matching Pairs
            const pairs = card.querySelectorAll('.matching-pair-item');
            pairs.forEach(p => {
                question.matchingPairs.push({
                    left: p.querySelector('[data-field="left"]').value,
                    right: p.querySelector('[data-field="right"]').value
                });
            });

            // Collect Distractors
            const distractors = card.querySelectorAll('.distractor-item');
            distractors.forEach(d => {
                const val = d.querySelector('[data-field="distractor"]').value;
                if(val) question.matchingDistractors.push(val);
            });
        } else {
            // Collect Standard Answers (MC, MA, TF, DD/MD)
            const answerItems = card.querySelectorAll('.answer-item');
            answerItems.forEach(item => {
                question.answers.push({
                    text: item.querySelector('[data-field="answer-text"]').value,
                    correct: item.querySelector('[data-field="answer-correct"]').checked,
                    feedback: item.querySelector('[data-field="answer-feedback"]').value || null,
                    dropdownVariable: item.querySelector('[data-field="answer-var"]')?.value || null
                });
            });
        }
        
        quizData.questions.push(question);
    });
}

// --- Rendering Logic ---

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
    card.className = 'card question-card';
    card.dataset.index = index;
    
    const questionTypes = [
        {val: 'MC', label: 'Multiple Choice'},
        {val: 'MA', label: 'Multiple Answers'},
        {val: 'TF', label: 'True/False'},
        {val: 'MT', label: 'Matching'},
        {val: 'DD', label: 'Multiple Dropdown'}
    ];
    
    const typeOptions = questionTypes.map(t => 
        `<option value="${t.val}" ${question.type === t.val ? 'selected' : ''}>${t.label} (${t.val})</option>`
    ).join('');
    
    // Header & Meta Data
    let html = `
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
                    <select class="form-select" data-field="type" onchange="changeQuestionType(${index}, this.value)">
                        ${typeOptions}
                    </select>
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
                        <textarea class="form-control" data-field="generalFeedback" rows="1">${escapeHtml(question.generalFeedback || '')}</textarea>
                    </div>
                    <div class="col-md-4">
                        <small>Correct</small>
                        <textarea class="form-control" data-field="correctFeedback" rows="1">${escapeHtml(question.correctFeedback || '')}</textarea>
                    </div>
                    <div class="col-md-4">
                        <small>Incorrect</small>
                        <textarea class="form-control" data-field="incorrectFeedback" rows="1">${escapeHtml(question.incorrectFeedback || '')}</textarea>
                    </div>
                </div>
            </div>
            
            <hr>
    `;

    // CONDITIONAL RENDERING BASED ON TYPE
    if (question.type === 'MT') {
        html += renderMatchingUI(question, index);
    } else {
        html += renderStandardAnswersUI(question, index);
    }

    html += `</div>`; // Close card-body
    card.innerHTML = html;
    return card;
}

// --- Specific UI Renderers ---

function renderStandardAnswersUI(question, index) {
    const isDropdown = question.type === 'DD' || question.type === 'MD';
    
    return `
        <div class="mt-3">
            <label class="form-label fw-bold">Answers</label>
            <div class="answer-list">
                ${renderStandardAnswersList(question.answers || [], index, isDropdown)}
            </div>
            <button class="btn btn-sm btn-outline-dark mt-2" onclick="addAnswer(${index})">
                &#43; Add Answer
            </button>
        </div>
    `;
}

function renderMatchingUI(question, index) {
    return `
        <div class="row mt-3">
            <div class="col-md-8">
                <label class="form-label fw-bold">Matching Pairs (Left = Prompt, Right = Match)</label>
                <div class="matching-list">
                    ${renderMatchingPairsList(question.matchingPairs || [], index)}
                </div>
                <button class="btn btn-sm btn-outline-dark mt-2" onclick="addMatchingPair(${index})">
                    &#43; Add Pair
                </button>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-bold">Distractors (Wrong Matches)</label>
                <div class="distractor-list">
                    ${renderDistractorsList(question.matchingDistractors || [], index)}
                </div>
                <button class="btn btn-sm btn-outline-dark mt-2" onclick="addDistractor(${index})">
                    &#43; Add Distractor
                </button>
            </div>
        </div>
    `;
}

// --- List Renderers ---

function renderStandardAnswersList(answers, qIdx, isDropdown) {
    if (!answers || answers.length === 0) return '<div class="text-muted fst-italic py-2">No answers yet.</div>';
    
    return answers.map((ans, aIdx) => `
        <div class="answer-item input-group mb-2">
            <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" 
                       data-field="answer-correct" ${ans.correct ? 'checked' : ''}>
            </div>
            ${isDropdown ? `<input type="text" class="form-control" style="max-width: 100px;" data-field="answer-var" value="${escapeHtml(ans.dropdownVariable || '')}" placeholder="[var]">` : ''}
            <input type="text" class="form-control" data-field="answer-text" 
                   value="${escapeHtml(ans.text || '')}" placeholder="Answer Text">
            <input type="text" class="form-control" data-field="answer-feedback" 
                   value="${escapeHtml(ans.feedback || '')}" placeholder="Feedback (Optional)">
            <button class="btn btn-outline-danger" onclick="removeAnswer(${qIdx}, ${aIdx})">&#215;</button>
        </div>
    `).join('');
}

function renderMatchingPairsList(pairs, qIdx) {
    if (!pairs || pairs.length === 0) return '<div class="text-muted fst-italic">No pairs yet.</div>';

    return pairs.map((pair, pIdx) => `
        <div class="matching-pair-item input-group mb-2">
            <span class="input-group-text">Pair</span>
            <input type="text" class="form-control" data-field="left" placeholder="Left Side (Prompt)" value="${escapeHtml(pair.left || '')}">
            <span class="input-group-text">&rarr;</span>
            <input type="text" class="form-control" data-field="right" placeholder="Right Side (Match)" value="${escapeHtml(pair.right || '')}">
            <button class="btn btn-outline-danger" onclick="removeMatchingPair(${qIdx}, ${pIdx})">&#215;</button>
        </div>
    `).join('');
}

function renderDistractorsList(distractors, qIdx) {
    if (!distractors || distractors.length === 0) return '<div class="text-muted fst-italic">No distractors.</div>';
    
    return distractors.map((dist, dIdx) => `
        <div class="distractor-item input-group mb-2">
            <input type="text" class="form-control" data-field="distractor" placeholder="Wrong Match" value="${escapeHtml(dist || '')}">
            <button class="btn btn-outline-danger" onclick="removeDistractor(${qIdx}, ${dIdx})">&#215;</button>
        </div>
    `).join('');
}

// --- Interaction Handlers ---

function changeQuestionType(index, newType) {
    collectQuizData(); // Save current state
    quizData.questions[index].type = newType;
    
    // Initialize arrays if missing for specific types
    if(newType === 'MT') {
        if(!quizData.questions[index].matchingPairs) quizData.questions[index].matchingPairs = [];
        if(!quizData.questions[index].matchingDistractors) quizData.questions[index].matchingDistractors = [];
    } else {
        if(!quizData.questions[index].answers) quizData.questions[index].answers = [];
    }
    
    renderQuiz(); // Re-render to show correct fields
}

function toggleQuestion(index) {
    const cardBody = document.querySelector(`[data-index="${index}"] .question-body-collapse`);
    cardBody.classList.toggle('show');
}

function addQuestion() {
    collectQuizData();
    quizData.questions.push({
        type: 'MC', title: 'New Question', prompt: '', points: 1.0, answers: []
    });
    renderQuiz();
}

function removeQuestion(index) {
    if (confirm('Delete Question ' + (index+1) + '?')) {
        collectQuizData();
        quizData.questions.splice(index, 1);
        renderQuiz();
    }
}

// -- Standard Answers Handlers --
function addAnswer(qIdx) {
    collectQuizData();
    if (!quizData.questions[qIdx].answers) quizData.questions[qIdx].answers = [];
    quizData.questions[qIdx].answers.push({ text: '', correct: false });
    renderQuiz();
}

function removeAnswer(qIdx, aIdx) {
    collectQuizData();
    quizData.questions[qIdx].answers.splice(aIdx, 1);
    renderQuiz();
}

// -- Matching Handlers --
function addMatchingPair(qIdx) {
    collectQuizData();
    if (!quizData.questions[qIdx].matchingPairs) quizData.questions[qIdx].matchingPairs = [];
    quizData.questions[qIdx].matchingPairs.push({ left: '', right: '' });
    renderQuiz();
}

function removeMatchingPair(qIdx, pIdx) {
    collectQuizData();
    quizData.questions[qIdx].matchingPairs.splice(pIdx, 1);
    renderQuiz();
}

function addDistractor(qIdx) {
    collectQuizData();
    if (!quizData.questions[qIdx].matchingDistractors) quizData.questions[qIdx].matchingDistractors = [];
    quizData.questions[qIdx].matchingDistractors.push("");
    renderQuiz();
}

function removeDistractor(qIdx, dIdx) {
    collectQuizData();
    quizData.questions[qIdx].matchingDistractors.splice(dIdx, 1);
    renderQuiz();
}

// -- Utils --
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}