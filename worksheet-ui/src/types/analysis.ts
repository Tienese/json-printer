export interface GradedQuestionResult {
  questionNumber: number;
  questionText: string;
  selectedOption: string;
  selectedAnswerText: string;
  correct: boolean;
  pointsEarned: number;
  pointsPossible: number;
  feedback: string;
}

export interface StudentQuizResult {
  studentName: string;
  studentId: string;
  totalScore: number;
  totalPossible: number;
  percentage: number;
  questions: GradedQuestionResult[];
}

export interface BatchQuizAnalysis {
  quizTitle: string;
  quizId: number;
  studentCount: number;
  averageScore: number;
  averagePercentage: number;
  studentResults: StudentQuizResult[];
}
