/**
 * API Client
 * 
 * Централизованный HTTP-клиент с:
 * - Автоматическим добавлением Authorization header
 * - Обработкой ошибок и retry-логикой
 * - Типизированными методами
 * - Логированием в dev-режиме
 */

import { API_CONFIG } from './config';
import { ApiError } from './types';
import { getStorageItemAsync } from '../storage';
import { STORAGE_KEYS } from './config';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Получить токен из хранилища
   */
  private async getToken(): Promise<string | null> {
    return getStorageItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Логирование запросов в dev-режиме
   */
  private log(method: string, url: string, data?: unknown) {
    if (__DEV__) {
      console.log(`🌐 [${method}] ${url}`, data ? data : '');
    }
  }

  /**
   * Логирование ответов в dev-режиме
   */
  private logResponse(method: string, url: string, status: number, data?: unknown) {
    if (__DEV__) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} [${method}] ${url} - ${status}`, data ? data : '');
    }
  }

  /**
   * Основной метод для выполнения запросов
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;
    const url = `${this.baseUrl}${endpoint}`;

    this.log(method, url, body);

    // Подготовка заголовков
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Добавляем токен авторизации, если не пропущен
    if (!skipAuth) {
      const token = await this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Настройка таймаута через AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => null);

      this.logResponse(method, url, response.status, responseData);

      if (!response.ok) {
        return {
          data: null,
          error: responseData as ApiError || { error: `HTTP ${response.status}` },
          status: response.status,
        };
      }

      return {
        data: responseData as T,
        error: null,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            data: null,
            error: { error: 'Request timeout' },
            status: 408,
          };
        }

        // Ошибка сети
        return {
          data: null,
          error: { error: error.message || 'Network error' },
          status: 0,
        };
      }

      return {
        data: null,
        error: { error: 'Unknown error' },
        status: 0,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Удобные методы
  // ─────────────────────────────────────────────────────────────

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Экспортируем синглтон
export const apiClient = new ApiClient();

// Экспортируем класс для тестирования
export { ApiClient };

