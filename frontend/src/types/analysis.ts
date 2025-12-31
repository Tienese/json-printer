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

// Analytics type definitions for statistics page

export interface QuizStatistics {
  quizId: number;
  quizTitle: string;
  generatedAt: string;
  submissionStatistics: SubmissionStatistics;
  questionStatistics: Record<number, QuestionStatistics>;
}

export interface SubmissionStatistics {
  uniqueCount: number;
  scoreAverage: number;
  scoreHigh: number;
  scoreLow: number;
  scoreStdev: number;
  scores: Record<number, number>;
  correctCountAverage: number;
  incorrectCountAverage: number;
  durationAverage: number | null;
}

export interface QuestionStatistics {
  questionNumber: number;
  questionType: string;
  responses: number;
  correctStudentCount: number;
  incorrectStudentCount: number;
  difficultyIndex: number;
  variance: number;
  stdev: number;
  topStudentCount: number;
  bottomStudentCount: number;
  correctTopStudentCount: number;
  correctBottomStudentCount: number;
}
