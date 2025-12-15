import { apiClient } from './api';
import type {
  UserQuizJson,
  QuizValidationResult,
  ParseQuizResponse,
  ProcessQuizResponse,
} from '../types';

/**
 * Service for interacting with QTI Converter APIs.
 */
export const qtiService = {
  /**
   * Parse uploaded JSON file or pasted JSON text.
   * @param jsonFile - File object containing quiz JSON
   * @param jsonText - Text string containing quiz JSON
   */
  async parseQuiz(jsonFile?: File, jsonText?: string): Promise<ParseQuizResponse> {
    const formData = new FormData();

    if (jsonFile) {
      formData.append('jsonFile', jsonFile);
    }
    if (jsonText) {
      formData.append('jsonText', jsonText);
    }

    const response = await apiClient.post<ParseQuizResponse>('/quiz/api/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Validate quiz JSON without importing.
   * @param jsonText - Quiz JSON as string
   */
  async validateQuiz(jsonText: string): Promise<QuizValidationResult> {
    const response = await apiClient.post<QuizValidationResult>('/quiz/validate', jsonText, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    return response.data;
  },

  /**
   * Process quiz and import to Canvas.
   * @param courseId - Canvas course ID
   * @param quiz - Quiz object to process
   */
  async processAndImport(courseId: string, quiz: UserQuizJson): Promise<ProcessQuizResponse> {
    const request = {
      courseId,
      quizJson: JSON.stringify(quiz),
    };

    const response = await apiClient.post<ProcessQuizResponse>(
      '/quiz/api/process',
      request
    );

    return response.data;
  },
};
