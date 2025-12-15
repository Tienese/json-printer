import { apiClient } from './api';
import type { Course, Quiz } from '../types';

/**
 * Service for interacting with course and quiz APIs.
 */
export const courseService = {
  /**
   * Fetch all Canvas courses.
   * @param refresh - If true, bypass cache and fetch fresh data
   */
  async getCourses(refresh = false): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/api/courses', {
      params: refresh ? { refresh: true } : undefined,
    });
    return response.data;
  },

  /**
   * Fetch all quizzes for a specific course.
   * @param courseId - The Canvas course ID
   * @param refresh - If true, bypass cache and fetch fresh data
   */
  async getQuizzes(courseId: number, refresh = false): Promise<Quiz[]> {
    const response = await apiClient.get<Quiz[]>(`/api/courses/${courseId}/quizzes`, {
      params: refresh ? { refresh: true } : undefined,
    });
    return response.data;
  },

  /**
   * Clear all caches (both courses and quizzes).
   */
  async clearCache(): Promise<void> {
    await apiClient.post('/api/cache/refresh');
  },
};
