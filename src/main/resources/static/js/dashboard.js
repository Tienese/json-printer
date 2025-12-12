// Dashboard state
let currentCourseId = null;
let currentCourseName = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    loadCourses(false);

    // Refresh button handler
    document.getElementById('refreshBtn').addEventListener('click', function() {
        loadCourses(true);
    });

    // Modal close on background click
    document.getElementById('quizModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeQuizModal();
        }
    });
});

/**
 * Load courses from API
 * @param {boolean} refresh - Force refresh from Canvas
 */
async function loadCourses(refresh = false) {
    const loadingState = document.getElementById('loadingState');
    const coursesGrid = document.getElementById('coursesGrid');
    const emptyState = document.getElementById('emptyState');
    const errorAlert = document.getElementById('errorAlert');
    const refreshBtn = document.getElementById('refreshBtn');

    // Show loading state
    loadingState.style.display = 'block';
    coursesGrid.innerHTML = '';
    emptyState.style.display = 'none';
    errorAlert.style.display = 'none';

    if (refresh) {
        refreshBtn.classList.add('refreshing');
    }

    try {
        const response = await fetch(`/api/courses?refresh=${refresh}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load courses');
        }

        console.log(`Loaded ${data.count} courses (fetch time: ${data.fetchTime}ms)`);

        // Hide loading state
        loadingState.style.display = 'none';
        refreshBtn.classList.remove('refreshing');

        if (data.courses.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        // Render courses
        renderCourses(data.courses);

    } catch (error) {
        console.error('Error loading courses:', error);
        loadingState.style.display = 'none';
        refreshBtn.classList.remove('refreshing');

        // Show error
        document.getElementById('errorMessage').textContent = error.message;
        errorAlert.style.display = 'flex';
    }
}

/**
 * Render courses grid
 */
function renderCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');

    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" onclick="openCourse('${course.id}', '${escapeHtml(course.name)}')">
            <span class="course-badge ${course.workflowState !== 'available' ? 'inactive' : ''}">
                ${course.workflowState === 'available' ? 'Active' : 'Inactive'}
            </span>
            <div class="course-header">
                <h3 class="course-name">${escapeHtml(course.name)}</h3>
                <p class="course-code">${escapeHtml(course.courseCode || '')}</p>
            </div>
            <div class="course-meta">
                <div class="meta-item">
                    <span class="meta-icon">▸</span>
                    <span>View Quizzes</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Open course and load quizzes
 */
async function openCourse(courseId, courseName) {
    currentCourseId = courseId;
    currentCourseName = courseName;

    const modal = document.getElementById('quizModal');
    const modalCourseName = document.getElementById('modalCourseName');
    const quizLoadingState = document.getElementById('quizLoadingState');
    const quizGrid = document.getElementById('quizGrid');
    const quizEmptyState = document.getElementById('quizEmptyState');

    // Show modal
    modal.style.display = 'flex';
    modalCourseName.textContent = courseName;
    quizLoadingState.style.display = 'block';
    quizGrid.innerHTML = '';
    quizEmptyState.style.display = 'none';

    try {
        const response = await fetch(`/api/courses/${courseId}/quizzes`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load quizzes');
        }

        console.log(`Loaded ${data.count} quizzes for course ${courseId}`);

        quizLoadingState.style.display = 'none';

        if (data.quizzes.length === 0) {
            quizEmptyState.style.display = 'block';
            return;
        }

        // Render quizzes
        renderQuizzes(data.quizzes);

    } catch (error) {
        console.error('Error loading quizzes:', error);
        quizLoadingState.style.display = 'none';
        quizGrid.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

/**
 * Render quizzes in modal
 */
function renderQuizzes(quizzes) {
    const quizGrid = document.getElementById('quizGrid');

    quizGrid.innerHTML = quizzes.map(quiz => {
        const description = quiz.description
            ? stripHtml(quiz.description).substring(0, 150) + (quiz.description.length > 150 ? '...' : '')
            : 'No description';

        return `
            <div class="quiz-card">
                <div class="quiz-header">
                    <h4 class="quiz-title">${escapeHtml(quiz.title)}</h4>
                    <span class="quiz-status ${quiz.published ? 'published' : 'unpublished'}">
                        ${quiz.published ? 'Published' : 'Unpublished'}
                    </span>
                </div>
                <p class="quiz-description">${escapeHtml(description)}</p>
                <div class="quiz-metadata">
                    <div class="quiz-meta-item">
                        <span>•</span>
                        <span><strong>${quiz.questionCount ?? 'N/A'}</strong> questions</span>
                    </div>
                    <div class="quiz-meta-item">
                        <span>◆</span>
                        <span><strong>${quiz.pointsPossible ?? 'N/A'}</strong> points</span>
                    </div>
                    <div class="quiz-meta-item">
                        <span>○</span>
                        <span>${quiz.timeLimit ? quiz.timeLimit + ' min' : 'No limit'}</span>
                    </div>
                    <div class="quiz-meta-item">
                        <span>▪</span>
                        <span>${quiz.quizType || 'Quiz'}</span>
                    </div>
                </div>
                <div class="quiz-actions">
                    <a href="/print-report?type=slip&courseId=${currentCourseId}&quizId=${quiz.id}&quizTitle=${encodeURIComponent(quiz.title)}"
                       class="btn btn-primary">
                        □ Retake Slip
                    </a>
                    <a href="/print-report?type=full&courseId=${currentCourseId}&quizId=${quiz.id}&quizTitle=${encodeURIComponent(quiz.title)}"
                       class="btn btn-secondary">
                        ▪ Full Report
                    </a>
                    <a href="/print-report/blank-quiz?courseId=${currentCourseId}&quizId=${quiz.id}"
                       class="btn btn-secondary">
                        • Blank Quiz
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Close quiz modal
 */
function closeQuizModal() {
    document.getElementById('quizModal').style.display = 'none';
    currentCourseId = null;
    currentCourseName = null;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}
