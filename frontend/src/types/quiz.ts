/**
 * DTO for Canvas quiz list items (summary view).
 * Contains metadata displayed in quiz browser.
 * Maps to GET /api/v1/courses/{id}/quizzes response.
 */
export interface Quiz {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  pointsPossible: number;
  timeLimit: number | null;
  published: boolean;
  quizType: string;
}

/**
 * Full quiz metadata from Canvas API.
 * Used for print report generation.
 */
export interface QuizDetail {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  pointsPossible: number;
  timeLimit: number | null;
  published: boolean;
  quizType: string;
}

/**
 * Question from Canvas quiz.
 */
export interface Question {
  id: number;
  quizId: number;
  position: number;
  questionName: string;
  questionText: string;
  questionType: string;
  pointsPossible: number;
  answers: Answer[];
  correctComments: string | null;
  incorrectComments: string | null;
  neutralComments: string | null;
}

/**
 * Answer option for a question.
 */
export interface Answer {
  id: number;
  text: string;
  weight: number;
  comments: string | null;
}
