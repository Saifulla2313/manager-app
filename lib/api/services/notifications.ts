/**
 * Notifications Service
 * 
 * Сервис для работы с уведомлениями.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { Notification } from '../types';

export const notificationsService = {
  /**
   * Получить список уведомлений текущего пользователя
   */
  async getAll() {
    return apiClient.get<{ notifications: Notification[]; unreadCount: number }>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS
    );
  },

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(id: string) {
    return apiClient.patch<{ notification: Notification }>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_READ(id)
    );
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead() {
    return apiClient.post<{ success: boolean }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS_READ_ALL);
  },
};

