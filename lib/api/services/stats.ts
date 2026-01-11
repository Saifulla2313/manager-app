/**
 * Stats Service
 * 
 * Сервис для получения статистики.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { DashboardStats, EmployeeStats } from '../types';

export const statsService = {
  /**
   * Получить статистику для дашборда менеджера
   */
  async getDashboard() {
    return apiClient.get<DashboardStats>(API_CONFIG.ENDPOINTS.STATS_DASHBOARD);
  },

  /**
   * Получить статистику для сотрудника
   */
  async getEmployee() {
    return apiClient.get<EmployeeStats>(API_CONFIG.ENDPOINTS.STATS_EMPLOYEE);
  },

  /**
   * Проверить доступность сервера
   */
  async healthCheck() {
    return apiClient.get<{ status: string; timestamp: string }>(
      API_CONFIG.ENDPOINTS.HEALTH, 
      { skipAuth: true }
    );
  },
};

