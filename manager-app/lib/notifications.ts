/**
 * Push Notifications Service
 * Handles registration, permissions, and notification handling
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Регистрация устройства для push-уведомлений
 * @returns Expo Push Token или null при ошибке
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Push-уведомления работают только на реальных устройствах
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Настройка канала для Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Задачи',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6600',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Срочные задачи',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
    });
  }

  // Проверяем и запрашиваем разрешения
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Получаем Expo Push Token
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.log('Project ID not found, using development token');
      // Для разработки возвращаем фиктивный токен
      return 'development-token';
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    token = pushToken.data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return token;
}

/**
 * Настройка слушателей уведомлений
 */
export function setupNotificationListeners() {
  // Слушатель входящих уведомлений (когда приложение открыто)
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  // Слушатель нажатий на уведомления
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response:', response);
    handleNotificationResponse(response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Обработка нажатия на уведомление
 */
function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;

  // Навигация по URL из уведомления
  if (data?.url && typeof data.url === 'string') {
    router.push(data.url as any);
    return;
  }

  // Навигация к задаче
  if (data?.taskId) {
    router.push({
      pathname: '/(user)/(employee)/task-details',
      params: { taskId: data.taskId as string },
    });
  }
}

/**
 * Отправка локального уведомления (для тестирования)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Немедленная отправка
  });
}

/**
 * Планирование уведомления о дедлайне
 */
export async function scheduleDeadlineNotification(
  taskId: string,
  taskTitle: string,
  deadline: Date,
  minutesBefore: number = 30
) {
  const triggerDate = new Date(deadline.getTime() - minutesBefore * 60 * 1000);

  // Не планируем, если время уже прошло
  if (triggerDate <= new Date()) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Скоро дедлайн!',
      body: `Задача "${taskTitle}" должна быть выполнена через ${minutesBefore} минут`,
      data: { taskId, type: 'deadline' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return identifier;
}

/**
 * Отмена запланированного уведомления
 */
export async function cancelScheduledNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Отмена всех запланированных уведомлений
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Получение количества непрочитанных уведомлений (badge)
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Установка badge count
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Сброс badge
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

