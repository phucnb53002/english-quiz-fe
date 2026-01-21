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
  content: string;
  options: string[];
  correctAnswer: number;
  level: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
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
