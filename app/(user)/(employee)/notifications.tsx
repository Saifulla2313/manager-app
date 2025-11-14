import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import CheckCircle from '@/components/Icons/CheckCircle';
import AlertCircle from '@/components/Icons/AlertCircle';
// Иконки-заглушки
const Bell = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

const Clock = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);
const MessageSquare = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);


export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    {
      id: '1',
      type: 'new-task',
      title: 'Назначена новая задача',
      message: 'Связаться с винным поставщиком',
      time: '5 минут назад',
      read: false,
      taskId: '2',
      icon: Bell,
      color: '#FF6600',
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Приближается срок выполнения',
      message: 'Связаться с винным поставщиком - осталось 2 часа',
      time: '30 минут назад',
      read: false,
      taskId: '2',
      icon: Clock,
      color: '#F59E0B',
    },
    {
      id: '3',
      type: 'comment',
      title: 'Менеджер прокомментировал вашу задачу',
      message: 'Пожалуйста, уделите приоритет этой задаче сегодня',
      time: '2 часа назад',
      read: true,
      taskId: '2',
      icon: MessageSquare,
      color: '#3B82F6',
    },
    {
      id: '4',
      type: 'completed',
      title: 'Задача выполнена',
      message: 'Вы выполнили "Обновить меню-доску"',
      time: '3 часа назад',
      read: true,
      taskId: '3',
      icon: CheckCircle,
      color: '#10B981',
    },
    {
      id: '5',
      type: 'overdue',
      title: 'Задача просрочена',
      message: 'Обучить нового бармена просрочена',
      time: '4 часа назад',
      read: true,
      taskId: '4',
      icon: AlertCircle,
      color: '#EF4444',
    },
    {
      id: '6',
      type: 'new-task',
      title: 'Назначена новая задача',
      message: 'Инвентаризация',
      time: 'Вчера',
      read: true,
      taskId: '5',
      icon: Bell,
      color: '#FF6600',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = (notification: any) => {
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationsList}>
          {notifications.map((notification) => {
            const Icon = notification.icon;
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
                    <Icon size={20} color={notification.color} />
                  </View>

                  <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Bell size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Уведомлений пока нет</Text>
            </View>
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