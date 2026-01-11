/**
 * Tasks Service
 * 
 * Сервис для работы с разовыми задачами.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  InstantTask, 
  InstantTaskDetail, 
  CreateTaskInput, 
  UpdateTaskInput,
  Comment 
} from '../types';

export const tasksService = {
  /**
   * Получить список задач
   * Менеджер видит все задачи, сотрудник — только свои
   */
  async getAll() {
    return apiClient.get<{ tasks: InstantTask[] }>(API_CONFIG.ENDPOINTS.TASKS);
  },

  /**
   * Получить детали задачи по ID
   */
  async getById(id: string) {
    return apiClient.get<{ task: InstantTaskDetail }>(API_CONFIG.ENDPOINTS.TASK(id));
  },

  /**
   * Создать новую задачу (только менеджер)
   */
  async create(input: CreateTaskInput) {
    return apiClient.post<{ task: InstantTask }>(API_CONFIG.ENDPOINTS.TASKS, input);
  },

  /**
   * Обновить задачу
   */
  async update(id: string, input: UpdateTaskInput) {
    return apiClient.patch<{ task: InstantTask }>(API_CONFIG.ENDPOINTS.TASK(id), input);
  },

  /**
   * Удалить задачу (только менеджер)
   */
  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(API_CONFIG.ENDPOINTS.TASK(id));
  },

  /**
   * Добавить комментарий к задаче
   */
  async addComment(taskId: string, message: string) {
    return apiClient.post<{ comment: Comment }>(
      API_CONFIG.ENDPOINTS.TASK_COMMENTS(taskId), 
      { message }
    );
  },

  /**
   * Отметить задачу как выполненную
   */
  async markAsDone(id: string, completionPhotos?: string[]) {
    return apiClient.patch<{ task: InstantTask }>(API_CONFIG.ENDPOINTS.TASK(id), {
      status: 'DONE',
      completionPhotos,
    });
  },
};

