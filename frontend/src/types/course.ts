/**
 * Types for Canvas courses and quizzes
 * Matches the DTOs from Spring Boot backend
 */

export interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  question_count: number;
  points_possible: number;
  time_limit: number | null;
  published: boolean;
  quiz_type: string;
}

export interface CoursesResponse {
  success: boolean;
  courses: Course[];
  count: number;
  fetchTime: number;
}

export interface QuizzesResponse {
  success: boolean;
  quizzes: Quiz[];
  count: number;
  fetchTime: number;
}
