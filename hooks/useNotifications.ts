/**
 * Notifications Hooks
 * 
 * Хуки для работы с уведомлениями.
 */

import { useApi, useMutation } from './useApi';
import { notificationsService } from '../lib/api';

/**
 * Хук для получения списка уведомлений
 */
export function useNotifications() {
  const result = useApi(() => notificationsService.getAll(), []);

  return {
    notifications: result.data?.notifications ?? [],
    unreadCount: result.data?.unreadCount ?? 0,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Хук для отметки уведомления как прочитанного
 */
export function useMarkNotificationRead() {
  return useMutation((id: string) =>
    notificationsService.markAsRead(id).then((res) => ({
      ...res,
      data: res.data ? res.data.notification : null,
    }))
  );
}

/**
 * Хук для отметки всех уведомлений как прочитанных
 */
export function useMarkAllNotificationsRead() {
  return useMutation(() => notificationsService.markAllAsRead());
}

