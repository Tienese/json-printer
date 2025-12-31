/**
 * Types for Print Report feature
 * Matches QuizPrintViewModel from Spring Boot backend
 */

export type AnswerStatus = 'CORRECT' | 'INCORRECT' | 'MISSED';

export interface QuestionOption {
  optionLetter: string;
  optionText: string;
  isCorrect: boolean;
  isStudentAnswer: boolean;
  visualMarker: string;
  commentText: string;
}

export interface Question {
  questionNumber: number;
  questionText: string;
  pointsPossible: number;
  questionType: string;
  hasOptions: boolean;
  options: QuestionOption[];
  studentAnswerText: string;
  isCorrect: boolean;
  answerStatus: AnswerStatus;
  feedbackText: string;
}

export interface Student {
  studentName: string;
  studentId: string;
  questions: Question[];
  incorrectQuestionNumbers: number[];
}

export interface QuizPrintViewModel {
  quizTitle: string;
  quizId: number;
  studentCount: number;
  students: Student[];
}

export type ReportType = 'full' | 'slip' | 'blank';
