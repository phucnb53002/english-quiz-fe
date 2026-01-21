import { api } from './api';
import { LoginCredentials, AuthResponse, User, Question } from '@/types';

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

export const testsApi = {
  getAll: async (): Promise<Question[]> => {
    const { data } = await api.get<Question[]>('/questions');
    return data;
  },

  getOne: async (id: string): Promise<Question> => {
    const { data } = await api.get<Question>(`/questions/${id}`);
    return data;
  },

  create: async (questionData: {
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
};
