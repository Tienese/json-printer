/**
 * Course and Quiz API
 * Endpoints: /api/courses, /api/courses/{id}/quizzes
 */

import { api } from './client';
import type { Course, Quiz, CoursesResponse, QuizzesResponse } from '../types/course';

/**
 * Fetch all courses for the authenticated user
 * @param refresh - If true, bypass cache and fetch fresh data
 */
export async function getCourses(refresh = false): Promise<Course[]> {
  const data = await api.get<CoursesResponse>(
    `/api/courses${refresh ? '?refresh=true' : ''}`
  );
  return data.courses;
}

/**
 * Fetch quizzes for a specific course
 * @param courseId - Canvas course ID
 * @param refresh - If true, bypass cache and fetch fresh data
 */
export async function getQuizzes(courseId: string | number, refresh = false): Promise<Quiz[]> {
  const data = await api.get<QuizzesResponse>(
    `/api/courses/${courseId}/quizzes${refresh ? '?refresh=true' : ''}`
  );
  return data.quizzes;
}

/**
 * Refresh the course/quiz cache
 */
export async function refreshCache(): Promise<void> {
  await api.post('/api/cache/refresh');
}
