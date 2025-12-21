# Canvas API Reference (Inferred from Context)

This document summarizes the structure of the Canvas API responses found in `canvas_context/`.

## 1. List Quizzes (`/api/v1/courses/:id/quizzes`)

**Response format:** Array of Quiz Objects.

**Key Fields:**
- `id` (Integer): Unique identifier for the quiz.
- `title` (String): The title of the quiz.
- `description` (String, HTML): Description/instructions for the quiz.
- `html_url` (String): Web URL to view the quiz.
- `mobile_url` (String): Mobile-friendly URL.
- `quiz_type` (String): Type of quiz (e.g., "assignment", "practice_quiz", "graded_survey", "survey").
- `question_count` (Integer): Number of questions in the quiz.
- `points_possible` (Number): Total points possible.
- `time_limit` (Integer): Time limit in minutes (null if none).
- `allowed_attempts` (Integer): Number of allowed attempts (-1 for infinite).
- `version_number` (Integer): Current version of the quiz.
- `published` (Boolean): Whether the quiz is published.
- `assignment_id` (Integer): Associated assignment ID (if graded).
- `assignment_group_id` (Integer): Assignment group ID.
- `shuffle_answers` (Boolean): If answers are shuffled.
- `show_correct_answers` (Boolean): If students can see correct answers.
- `one_question_at_a_time` (Boolean): If we show one question per page.
- `cant_go_back` (Boolean): If locked questions after answering.
- `access_code` (String): Access code restricted.
- `ip_filter` (String): IP filter.
- `due_at` (String, ISO8601): Due date.
- `lock_at` (String, ISO8601): Lock date.
- `unlock_at` (String, ISO8601): Unlock date.

## 2. List Quiz Questions (`/api/v1/courses/:id/quizzes/:id/questions`)

**Response format:** Array of Question Objects.

**Key Fields:**
- `id` (Integer): Unique identifier for the question.
- `quiz_id` (Integer): ID of the quiz it belongs to.
- `quiz_group_id` (Integer): ID of the question group (if any).
- `assessment_question_id` (Integer): ID for the underlying assessment question.
- `position` (Integer): Order in the quiz.
- `question_name` (String): Short name/title of the question.
- `question_type` (String): Type (e.g., "multiple_choice_question", "true_false_question", "short_answer_question", "fill_in_multiple_blanks_question", "matching_question", "essay_question").
- `question_text` (String, HTML): The question content.
- `points_possible` (Number): Points for this question.
- `correct_comments` (String): Feedback for correct answer.
- `incorrect_comments` (String): Feedback for incorrect answer.
- `neutral_comments` (String): General feedback.
- `answers` (Array): List of potential answers.

### Answer Object Structure
The `answers` array contains objects with:
- `id` (Integer): Unique answer ID.
- `text` (String): Text of the answer.
- `html` (String): HTML content of the answer (if rich text).
- `comments` (String): Specific feedback for this answer.
- `weight` (Number): Weight of the answer (100 for correct, 0 for incorrect usually).
- `match_id` (Integer): For matching questions.

## 3. List Courses (`/api/v1/courses`)

**Key Fields:**
- `id` (Integer)
- `name` (String)
- `account_id` (Integer)
- `uuid` (String)
- `start_at` (String)
- `grading_standard_id` (Integer)
- `is_public` (Boolean)
- `course_code` (String)
- `default_view` (String)
- `enrollment_term_id` (Integer)
