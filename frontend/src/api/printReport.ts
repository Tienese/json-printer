/**
 * Print Report API
 * Endpoints: /print-report/api/generate, /print-report/api/blank-quiz
 */

import { api } from './client';
import type { QuizPrintViewModel, ReportType } from '../types/printReport';

/**
 * Generate a print report from Canvas quiz data and CSV submissions
 * @param courseId - Canvas course ID
 * @param quizId - Canvas quiz ID
 * @param csvFile - CSV file with student submissions
 * @param reportType - Type of report (full, slip)
 */
export async function generateReport(
  courseId: string,
  quizId: string,
  csvFile: File,
  reportType: ReportType = 'full'
): Promise<QuizPrintViewModel> {
  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('quizId', quizId);
  formData.append('csvFile', csvFile);
  formData.append('reportType', reportType);

  return api.post<QuizPrintViewModel>('/api/print-report/generate', formData);
}

/**
 * Generate a blank quiz worksheet (no student answers)
 * @param courseId - Canvas course ID
 * @param quizId - Canvas quiz ID
 */
export async function getBlankQuiz(
  courseId: string,
  quizId: string
): Promise<QuizPrintViewModel> {
  return api.get<QuizPrintViewModel>(
    `/api/print-report/blank-quiz?courseId=${courseId}&quizId=${quizId}`
  );
}
