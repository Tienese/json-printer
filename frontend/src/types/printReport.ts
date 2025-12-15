/**
 * TypeScript types for Print Report feature.
 */

export interface OptionView {
  letter: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
  feedback?: string;
}

export interface QuestionView {
  questionNumber: number;
  questionText: string;
  questionType: string;
  points: number;
  options: OptionView[];
  feedbackText?: string;
  answerStatus: 'CORRECT' | 'INCORRECT' | 'UNANSWERED';
  visualMarker: string; // ✓, ✗, ▲
}

export interface StudentQuizView {
  studentName: string;
  studentId: string;
  questions: QuestionView[];
  incorrectQuestionNumbers: number[];
}

export interface QuizPrintViewModel {
  quizTitle: string;
  quizId: number;
  studentCount: number;
  students: StudentQuizView[];
}
