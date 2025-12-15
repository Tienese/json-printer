import { apiClient } from './api';
import type { QuizPrintViewModel } from '../types';

/**
 * Service for interacting with Print Report APIs.
 */
export const printReportService = {
  /**
   * Generate print report from Canvas quiz and CSV file.
   * @param courseId - Canvas course ID
   * @param quizId - Canvas quiz ID
   * @param csvFile - CSV file with student submissions
   * @param reportType - "full" or "slip"
   */
  async generateReport(
    courseId: string,
    quizId: string,
    csvFile: File,
    reportType: string = 'slip'
  ): Promise<QuizPrintViewModel> {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('quizId', quizId);
    formData.append('csvFile', csvFile);
    formData.append('reportType', reportType);

    const response = await apiClient.post<QuizPrintViewModel>(
      '/print-report/api/generate',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Generate blank quiz worksheet.
   * @param courseId - Canvas course ID
   * @param quizId - Canvas quiz ID
   */
  async generateBlankQuiz(courseId: string, quizId: string): Promise<QuizPrintViewModel> {
    const response = await apiClient.get<QuizPrintViewModel>('/print-report/api/blank-quiz', {
      params: { courseId, quizId },
    });

    return response.data;
  },
};
