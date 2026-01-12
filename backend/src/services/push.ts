/**
 * Push Notification Service
 * Отправка push-уведомлений через Expo Push API
 */

import { prisma } from '../lib/prisma';

// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

/**
 * Отправка push-уведомления одному пользователю
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });

  if (tokens.length === 0) {
    console.log(`No push tokens for user ${userId}`);
    return;
  }

  const messages: PushMessage[] = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  }));

  await sendPushNotifications(messages);
}

/**
 * Отправка push-уведомлений нескольким пользователям
 */
export async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  });

  if (tokens.length === 0) {
    console.log('No push tokens found for users');
    return;
  }

  const messages: PushMessage[] = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  }));

  await sendPushNotifications(messages);
}

/**
 * Отправка push-уведомлений через Expo API
 */
async function sendPushNotifications(messages: PushMessage[]): Promise<ExpoPushTicket[]> {
  // Expo рекомендует отправлять не более 100 уведомлений за раз
  const chunks = chunkArray(messages, 100);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = (await response.json()) as { data?: ExpoPushTicket[] };
      
      if (result.data) {
        tickets.push(...result.data);
        
        // Логируем ошибки
        result.data.forEach((ticket, index: number) => {
          if (ticket.status === 'error') {
            console.error(`Push notification error for ${chunk[index].to}:`, ticket.message);
            
            // Удаляем невалидные токены
            if (ticket.details?.error === 'DeviceNotRegistered') {
              removeInvalidToken(chunk[index].to);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to send push notifications:', error);
    }
  }

  return tickets;
}

/**
 * Удаление невалидного токена
 */
async function removeInvalidToken(token: string): Promise<void> {
  try {
    await prisma.pushToken.deleteMany({
      where: { token },
    });
    console.log(`Removed invalid push token: ${token}`);
  } catch (error) {
    console.error('Failed to remove invalid token:', error);
  }
}

/**
 * Разбиение массива на чанки
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ─────────────────────────────────────────────────────────────
// Готовые функции для типичных уведомлений
// ─────────────────────────────────────────────────────────────

/**
 * Уведомление о новой задаче
 */
export async function notifyNewTask(
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  creatorName: string
): Promise<void> {
  await sendPushToUser(
    assigneeId,
    '📋 Новая задача',
    `${creatorName} назначил вам задачу: "${taskTitle}"`,
    { taskId, type: 'NEW_TASK', url: `/(user)/(employee)/task-details?taskId=${taskId}` }
  );
}

/**
 * Уведомление о приближающемся дедлайне
 */
export async function notifyDeadlineApproaching(
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  minutesLeft: number
): Promise<void> {
  const timeText = minutesLeft >= 60 
    ? `${Math.floor(minutesLeft / 60)} ч.` 
    : `${minutesLeft} мин.`;
    
  await sendPushToUser(
    assigneeId,
    '⏰ Скоро дедлайн!',
    `Задача "${taskTitle}" должна быть выполнена через ${timeText}`,
    { taskId, type: 'DEADLINE', url: `/(user)/(employee)/task-details?taskId=${taskId}` }
  );
}

/**
 * Уведомление о просроченной задаче
 */
export async function notifyTaskOverdue(
  assigneeId: string,
  taskId: string,
  taskTitle: string
): Promise<void> {
  await sendPushToUser(
    assigneeId,
    '🚨 Задача просрочена!',
    `Срок выполнения задачи "${taskTitle}" истёк`,
    { taskId, type: 'OVERDUE', url: `/(user)/(employee)/task-details?taskId=${taskId}` }
  );
}

/**
 * Уведомление менеджеру о выполненной задаче
 */
export async function notifyTaskCompleted(
  managerId: string,
  taskId: string,
  taskTitle: string,
  employeeName: string
): Promise<void> {
  await sendPushToUser(
    managerId,
    '✅ Задача выполнена',
    `${employeeName} выполнил задачу "${taskTitle}"`,
    { taskId, type: 'COMPLETED', url: `/(user)/(manager)/instant/task-details?taskId=${taskId}` }
  );
}

/**
 * Уведомление о новом комментарии
 */
export async function notifyNewComment(
  userId: string,
  taskId: string,
  taskTitle: string,
  authorName: string,
  commentPreview: string
): Promise<void> {
  const preview = commentPreview.length > 50 
    ? commentPreview.substring(0, 50) + '...' 
    : commentPreview;
    
  await sendPushToUser(
    userId,
    `💬 ${authorName} оставил комментарий`,
    `К задаче "${taskTitle}": ${preview}`,
    { taskId, type: 'COMMENT', url: `/(user)/(employee)/task-details?taskId=${taskId}` }
  );
}

