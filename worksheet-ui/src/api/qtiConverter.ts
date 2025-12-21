/**
 * QTI Converter API
 * Endpoints: /quiz/api/parse, /quiz/api/process, /quiz/validate
 */

import { api } from './client';
import type {
  Quiz,
  ValidationResult,
  ParseQuizResponse,
  ProcessQuizResponse,
} from '../types/qti';

/**
 * Parse JSON quiz file or text
 * @param jsonFile - JSON file to parse (optional)
 * @param jsonText - JSON text to parse (optional, used if no file)
 */
export async function parseQuiz(
  jsonFile?: File,
  jsonText?: string
): Promise<ParseQuizResponse> {
  const formData = new FormData();

  if (jsonFile) {
    formData.append('jsonFile', jsonFile);
  } else if (jsonText) {
    formData.append('jsonText', jsonText);
  }

  return api.post<ParseQuizResponse>('/quiz/api/parse', formData);
}

/**
 * Validate quiz JSON structure
 * @param quiz - Quiz object to validate
 */
export async function validateQuiz(quiz: Quiz): Promise<ValidationResult> {
  return api.post<ValidationResult>('/quiz/validate', JSON.stringify(quiz));
}

/**
 * Process quiz and import to Canvas
 * @param courseId - Canvas course ID to import into
 * @param quiz - Quiz object to convert and import
 */
export async function processQuiz(
  courseId: string,
  quiz: Quiz
): Promise<ProcessQuizResponse> {
  return api.post<ProcessQuizResponse>('/quiz/api/process', {
    courseId,
    quizJson: JSON.stringify(quiz),
  });
}
