/**
 * Employees Service
 * 
 * Сервис для работы с сотрудниками.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { Employee, EmployeeProfile } from '../types';

export const employeesService = {
  /**
   * Получить список всех сотрудников (только для менеджера)
   */
  async getAll() {
    return apiClient.get<{ employees: Employee[] }>(API_CONFIG.ENDPOINTS.EMPLOYEES);
  },

  /**
   * Получить профиль сотрудника по ID
   */
  async getById(id: string) {
    return apiClient.get<{ employee: EmployeeProfile }>(API_CONFIG.ENDPOINTS.EMPLOYEE(id));
  },
};

