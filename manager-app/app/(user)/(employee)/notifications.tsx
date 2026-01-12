import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import CheckCircle from '@/components/Icons/CheckCircle';
import AlertCircle from '@/components/Icons/AlertCircle';
import Bell from '@/components/Icons/Bell';
import { useNotifications, useMarkNotificationRead, useRefreshOnFocus } from '@/hooks';
import type { NotificationType } from '@/lib/api/types';

// Иконки-заглушки
const Clock = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);
const MessageSquare = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

// Хелпер для форматирования времени
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return 'вчера';
  return `${diffDays} дн. назад`;
}

// Получить иконку и цвет по типу уведомления
function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case 'NEW_TASK':
      return { Icon: Bell, color: '#FF6600' };
    case 'DEADLINE':
      return { Icon: Clock, color: '#F59E0B' };
    case 'COMMENT':
      return { Icon: MessageSquare, color: '#3B82F6' };
    case 'COMPLETED':
      return { Icon: CheckCircle, color: '#10B981' };
    case 'OVERDUE':
      return { Icon: AlertCircle, color: '#EF4444' };
    default:
      return { Icon: Bell, color: '#6B7280' };
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  // Загружаем данные с API
  const { notifications, unreadCount, isLoading, error, refetch } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  // Обновляем при фокусе
  useRefreshOnFocus(refetch);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    // Отмечаем как прочитанное
    if (!notification.read) {
      await markAsRead(notification.id);
      refetch();
    }

    // Переходим к задаче если есть taskId
    if (notification.taskId) {
      router.push({
        pathname: '/(user)/(employee)/task-details',
        params: { taskId: notification.taskId }
      });
    }
  };

  // Компонент бейджа
  const Badge = ({ children, style, textStyle }: any) => (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>{children}</Text>
    </View>
  );

  // Показываем загрузку
  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6600" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Уведомления</Text>
          {unreadCount > 0 && (
            <Badge 
              style={styles.unreadBadge}
              textStyle={styles.unreadBadgeText}
            >
              {unreadCount} новых
            </Badge>
          )}
        </View>
        <Text style={styles.headerSubtitle}>Будьте в курсе своих задач</Text>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.notificationsList}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Уведомлений пока нет</Text>
            </View>
          ) : (
            notifications.map((notification) => {
              const { Icon, color } = getNotificationStyle(notification.type);
              
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadNotification
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: '#F9FAFB' }]}>
                      <Icon size={20} color={color} />
                    </View>

                    <View style={styles.notificationText}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF6600',
  },
  unreadBadgeText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    flexShrink: 0,
  },
  notificationText: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6600',
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});
