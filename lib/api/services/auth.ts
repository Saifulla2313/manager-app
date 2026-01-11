/**
 * Auth Service
 * 
 * Сервис для работы с авторизацией.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { AuthResponse, User } from '../types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  position?: string;
  role?: 'MANAGER' | 'EMPLOYEE';
}

export const authService = {
  /**
   * Вход в систему
   */
  async login(input: LoginInput) {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, input, { skipAuth: true });
  },

  /**
   * Регистрация нового пользователя
   */
  async register(input: RegisterInput) {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, input, { skipAuth: true });
  },

  /**
   * Получить текущего пользователя
   */
  async me() {
    return apiClient.get<{ user: User }>(API_CONFIG.ENDPOINTS.ME);
  },
};

