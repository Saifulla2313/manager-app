/**
 * Hook for Push Notifications
 */

import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  clearBadge,
} from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api/client';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const { isAuthenticated, user } = useAuth();
  const tokenSentRef = useRef(false);

  useEffect(() => {
    // Регистрация для push-уведомлений
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token) {
        setPermissionStatus('granted');
      }
    });

    // Настройка слушателей
    const cleanup = setupNotificationListeners();

    // Слушатель для обновления состояния notification
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    return () => {
      cleanup();
      subscription.remove();
    };
  }, []);

  // Отправляем токен на сервер при авторизации
  useEffect(() => {
    if (isAuthenticated && expoPushToken && user && !tokenSentRef.current) {
      sendPushTokenToServer(expoPushToken);
      tokenSentRef.current = true;
    }

    // Сброс флага при выходе
    if (!isAuthenticated) {
      tokenSentRef.current = false;
    }
  }, [isAuthenticated, expoPushToken, user]);

  // Очистка badge при открытии приложения
  useEffect(() => {
    if (isAuthenticated) {
      clearBadge();
    }
  }, [isAuthenticated]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
  };
}

/**
 * Отправка push-токена на сервер
 */
async function sendPushTokenToServer(token: string) {
  try {
    await apiFetch('/auth/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken: token }),
    });
    console.log('Push token sent to server');
  } catch (error) {
    console.error('Failed to send push token:', error);
  }
}

