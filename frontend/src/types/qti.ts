/**
 * TypeScript types for QTI Converter feature.
 * Mirrors Java DTOs in com.qtihelper.demo.dto.quiz package.
 */

/**
 * Answer option for a question.
 */
export interface UserAnswer {
  text: string;
  correct: boolean;
  feedback?: string;
  blankId?: string;
  dropdownVariable?: string;
}

/**
 * Matching question pair.
 */
export interface MatchPair {
  left: string;
  right: string;
}

/**
 * Single question in a quiz.
 * Supported types: MC (Multiple Choice), MA (Multiple Answer),
 * TF (True/False), MT (Matching), MD (Multiple Dropdown), DD (Dropdown)
 */
export interface UserQuestion {
  type: string; // MC, MA, TF, MT, MD, DD
  title?: string;
  prompt: string;
  points: number;
  generalFeedback?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  answers: UserAnswer[];

  // For matching questions
  leftColumn?: string[];
  rightColumn?: string[];
  matches?: MatchPair[];
  matchingPairs?: MatchPair[];
  matchingDistractors?: string[];
}

/**
 * Quiz structure for QTI conversion.
 */
export interface UserQuizJson {
  title: string;
  description?: string;
  questions: UserQuestion[];
}

/**
 * Result of quiz validation.
 */
export interface QuizValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Result of QTI import process.
 */
export interface ImportResult {
  success: boolean;
  message: string;
  error?: string;

  manifestGenerated: boolean;
  manifestSize?: number;

  qtiContentGenerated: boolean;
  qtiContentSize?: number;
  questionCount?: number;

  zipCreated: boolean;
  zipSize?: number;

  canvasUploadCompleted: boolean;
  migrationStatus?: string;

  totalDurationMs: number;
}

/**
 * Request payload for parsing quiz JSON.
 */
export interface ParseQuizRequest {
  jsonFile?: File;
  jsonText?: string;
}

/**
 * Response from parsing quiz JSON.
 */
export interface ParseQuizResponse {
  quiz: UserQuizJson;
  questionCount: number;
}

/**
 * Request payload for processing and importing quiz.
 */
export interface ProcessQuizRequest {
  courseId: string;
  quizJson: string; // JSON serialized UserQuizJson
}

/**
 * Response from processing and importing quiz.
 */
export interface ProcessQuizResponse {
  success: boolean;
  message: string;
  quiz: UserQuizJson;
  importResult: ImportResult;
}
