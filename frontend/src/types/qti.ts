/**
 * Types for QTI Converter feature
 * Matches UserQuizJson and related DTOs from Spring Boot backend
 */

export type QuestionType = 'MC' | 'MA' | 'TF' | 'Essay' | 'Matching';

export interface Answer {
  text: string;
  correct: boolean;
  feedback?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  type: QuestionType;
  title?: string;
  prompt: string;
  points: number;
  answers: Answer[];
  matchingPairs?: MatchingPair[];
  matchingDistractors?: string[];
  generalFeedback?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
}

export interface QuizSettings {
  quizType?: 'assignment' | 'practice_quiz' | 'graded_survey' | 'survey';
  timeLimit?: number | null;        // Minutes, null = unlimited
  allowedAttempts?: number | null;  // -1 = unlimited
  scoringPolicy?: 'keep_highest' | 'keep_latest' | 'keep_average';
  shuffleAnswers?: boolean;
  showCorrectAnswers?: boolean;
  oneQuestionAtATime?: boolean;
  cantGoBack?: boolean;
  dueAt?: string | null;            // ISO 8601 datetime
  lockAt?: string | null;
  unlockAt?: string | null;
}

export interface Quiz {
  title: string;
  description?: string;
  questions: Question[];
  settings?: QuizSettings;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParseQuizResponse {
  quiz: Quiz;
  questionCount: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface ProcessQuizResponse {
  success: boolean;
  message: string;
  quiz: Quiz;
  importResult: ImportResult;
}
