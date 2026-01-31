import { api } from './api';
import { LoginCredentials, AuthResponse, User, Question, Result, Exam } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ message: string; userId: string }> => {
    const { data } = await api.post<{ message: string; userId: string }>(
      '/auth/register',
      userData
    );
    return data;
  },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getOne: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<User> => {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/users/${id}`);
    return data;
  },
};

export const examsApi = {
  getAll: async (): Promise<(Exam & { questionCount: number })[]> => {
    const { data } = await api.get<(Exam & { questionCount: number })[]>('/exams');
    return data;
  },

  getOne: async (id: string): Promise<{ exam: Exam; questions: Question[] }> => {
    const { data } = await api.get<{ exam: Exam; questions: Question[] }>(`/exams/${id}`);
    return data;
  },

  create: async (examData: {
    title: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Exam> => {
    const { data } = await api.post<Exam>('/exams', examData);
    return data;
  },

  update: async (id: string, examData: Partial<Exam>): Promise<Exam> => {
    const { data } = await api.patch<Exam>(`/exams/${id}`, examData);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/exams/${id}`);
    return data;
  },

  getActive: async (): Promise<(Exam & { questionCount: number })[]> => {
    const { data } = await api.get<(Exam & { questionCount: number })[]>('/exams/active/all');
    return data;
  },

  getQuizQuestions: async (examId: string): Promise<Omit<Question, 'correctAnswer'>[]> => {
    const { data } = await api.get<Omit<Question, 'correctAnswer'>[]>(`/exams/${examId}/quiz`);
    return data;
  },

  submitQuiz: async (examId: string, answers: { questionId: string; answer: number }[]): Promise<{
    score: number;
    total: number;
    percentage: number;
    results: { questionId: string; correct: boolean; yourAnswer: number; correctAnswer: number }[];
  }> => {
    const { data } = await api.post(`/exams/${examId}/submit`, { answers });
    return data;
  },
};

export const testsApi = {
  getAll: async (): Promise<Question[]> => {
    const { data } = await api.get<Question[]>('/questions');
    return data;
  },

  getByExam: async (examId: string): Promise<Question[]> => {
    const { data } = await api.get<Question[]>(`/questions?examId=${examId}`);
    return data;
  },

  getOne: async (id: string): Promise<Question> => {
    const { data } = await api.get<Question>(`/questions/${id}`);
    return data;
  },

  create: async (questionData: {
    examId?: string;
    content: string;
    options: string[];
    correctAnswer: number;
    level?: 'easy' | 'medium' | 'hard';
  }): Promise<Question> => {
    const { data } = await api.post<Question>('/questions', questionData);
    return data;
  },

  update: async (
    id: string,
    questionData: Partial<Question>
  ): Promise<Question> => {
    const { data } = await api.patch<Question>(`/questions/${id}`, questionData);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/questions/${id}`);
    return data;
  },

  getQuizQuestions: async (): Promise<Omit<Question, 'correctAnswer'>[]> => {
    const { data } = await api.get<Omit<Question, 'correctAnswer'>[]>('/questions/quiz');
    return data;
  },

  submitQuiz: async (answers: { questionId: string; answer: number }[]): Promise<{
    score: number;
    total: number;
    percentage: number;
    results: { questionId: string; correct: boolean; yourAnswer: number; correctAnswer: number }[];
  }> => {
    const { data } = await api.post('/questions/submit', { answers });
    return data;
  },
};

export const resultsApi = {
  saveResult: async (resultData: {
    userId: string;
    userName: string;
    score: number;
    total: number;
    percentage: number;
    results: { questionId: string; correct: boolean; yourAnswer: number; correctAnswer: number }[];
    timeSpent: number;
  }): Promise<Result> => {
    const { data } = await api.post<Result>('/results', resultData);
    return data;
  },

  getMyHistory: async (): Promise<Result[]> => {
    const { data } = await api.get<Result[]>('/results/my-history');
    return data;
  },

  getMyStats: async (): Promise<{
    totalSubmissions: number;
    averageScore: number;
    bestScore: number;
    recentResults: Result[];
  }> => {
    const { data } = await api.get('/results/my-stats');
    return data;
  },

  getAll: async (): Promise<Result[]> => {
    const { data } = await api.get<Result[]>('/results');
    return data;
  },

  getStats: async (): Promise<{
    totalSubmissions: number;
    averageScore: number;
    passRate: number;
    recentResults: Result[];
    topResults: Result[];
  }> => {
    const { data } = await api.get('/results/stats');
    return data;
  },

  getOne: async (id: string): Promise<Result> => {
    const { data } = await api.get<Result>(`/results/${id}`);
    return data;
  },
};
