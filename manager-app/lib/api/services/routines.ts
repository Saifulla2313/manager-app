/**
 * Routines Service
 * 
 * Сервис для работы с регулярными чек-листами.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  RoutineTemplate, 
  DailyProgress, 
  CreateRoutineInput, 
  UpdateRoutineInput 
} from '../types';

export const routinesService = {
  /**
   * Получить список всех шаблонов
   * Менеджер видит все, сотрудник — только свои
   */
  async getAll() {
    return apiClient.get<{ templates: RoutineTemplate[] }>(API_CONFIG.ENDPOINTS.ROUTINES);
  },

  /**
   * Получить детали шаблона по ID
   */
  async getById(id: string) {
    return apiClient.get<{ template: RoutineTemplate }>(API_CONFIG.ENDPOINTS.ROUTINE(id));
  },

  /**
   * Создать новый шаблон (только менеджер)
   */
  async create(input: CreateRoutineInput) {
    return apiClient.post<{ template: RoutineTemplate }>(API_CONFIG.ENDPOINTS.ROUTINES, input);
  },

  /**
   * Обновить шаблон (только менеджер)
   */
  async update(id: string, input: UpdateRoutineInput) {
    return apiClient.patch<{ template: RoutineTemplate }>(API_CONFIG.ENDPOINTS.ROUTINE(id), input);
  },

  /**
   * Удалить шаблон (только менеджер)
   */
  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(API_CONFIG.ENDPOINTS.ROUTINE(id));
  },

  /**
   * Получить прогресс выполнения за конкретный день
   * @param id - ID шаблона
   * @param date - Дата в формате YYYY-MM-DD
   */
  async getProgress(id: string, date: string) {
    return apiClient.get<{ progress: DailyProgress }>(
      API_CONFIG.ENDPOINTS.ROUTINE_PROGRESS(id, date)
    );
  },

  /**
   * Отметить задачу в чек-листе как выполненную/невыполненную
   */
  async completeTask(
    templateId: string, 
    date: string, 
    taskId: string, 
    completed: boolean,
    photos?: string[]
  ) {
    return apiClient.post<{ completion: unknown }>(
      API_CONFIG.ENDPOINTS.ROUTINE_TASK_COMPLETE(templateId, date, taskId),
      { completed, photos }
    );
  },

  /**
   * Получить прогресс за сегодня
   */
  async getTodayProgress(id: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.getProgress(id, today);
  },
};

