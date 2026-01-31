export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  examId?: string;
  content: string;
  options: string[];
  correctAnswer: number;
  level: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamWithQuestions {
  exam: Exam;
  questions: Question[];
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  _id: string;
  content: string;
  options: string[];
  level: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  results: {
    questionId: string;
    correct: boolean;
    yourAnswer: number;
    correctAnswer: number;
  }[];
}

export interface Result {
  _id: string;
  userId: string;
  userName: string;
  score: number;
  total: number;
  percentage: number;
  results: {
    questionId: string;
    correct: boolean;
    yourAnswer: number;
    correctAnswer: number;
  }[];
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  recentResults: Result[];
}

export interface AdminStats {
  totalSubmissions: number;
  averageScore: number;
  passRate: number;
  recentResults: Result[];
  topResults: Result[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface ApiError {
  message: string;
}
