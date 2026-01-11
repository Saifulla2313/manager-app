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
import { useTasks, useEmployeeStats, useRefreshOnFocus } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import type { TaskPriority } from '@/lib/api/types';

// Хелпер для форматирования дедлайна
function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Без срока';
  
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) return 'Просрочено';
  if (diffHours < 1) return 'Менее часа';
  if (diffHours < 24) return `${diffHours} ч.`;
  if (diffDays === 1) return '1 день';
  return `${diffDays} дн.`;
}

// Иконка-заглушка для Clock
const Clock = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);

export default function EmployeeMainView() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  // Загружаем данные с API
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useEmployeeStats();

  // Обновляем при фокусе
  useRefreshOnFocus(() => {
    refetchTasks();
    refetchStats();
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchStats()]);
    setRefreshing(false);
  };

  const isLoading = tasksLoading || statsLoading;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'MEDIUM':
        return { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74' };
      case 'LOW':
        return { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' };
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH': return 'Высокий';
      case 'MEDIUM': return 'Средний';
      case 'LOW': return 'Низкий';
    }
  };

  // Компонент бейджа
  const Badge = ({ children, style, textStyle }: any) => (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>{children}</Text>
    </View>
  );

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: '/(user)/(employee)/task-details',
      params: { taskId }
    });
  };

  const handleMarkAsDone = (taskId: string) => {
    // TODO: Implement mark as done
    console.log('Mark task as done:', taskId);
  };

  // Показываем загрузку
  if (isLoading && tasks.length === 0) {
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
        <Text style={styles.headerTitle}>Мои задачи</Text>
        <Text style={styles.headerSubtitle}>
          С возвращением, {user?.name?.split(' ')[0] || 'Сотрудник'}!
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.sections}>
          {/* Stats */}
          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={32} color="#10B981" />
                <Text style={styles.statValue}>{stats?.completedToday ?? 0}</Text>
                <Text style={styles.statLabel}>Готово</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={32} color="#1E40AF" />
                <Text style={styles.statValue}>{stats?.pendingToday ?? 0}</Text>
                <Text style={styles.statLabel}>В работе</Text>
              </View>
              <View style={styles.statItem}>
                <AlertCircle size={32} color="#EF4444" />
                <Text style={styles.statValue}>{stats?.overdue ?? 0}</Text>
                <Text style={styles.statLabel}>Просрочено</Text>
              </View>
            </View>
          </View>

          {/* Today's Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Задачи на сегодня</Text>
            {tasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Нет задач на сегодня</Text>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {tasks.map((task) => {
                  const priorityColors = task.priority ? getPriorityColor(task.priority) : null;
                  const isCompleted = task.status === 'DONE';
                  
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCard}
                      onPress={() => handleTaskPress(task.id)}
                    >
                      <View style={styles.taskHeader}>
                        <Text style={[
                          styles.taskTitle,
                          isCompleted && styles.taskCompleted
                        ]}>
                          {task.title}
                        </Text>
                        {!isCompleted && priorityColors && (
                          <Badge 
                            style={{
                              backgroundColor: priorityColors.bg,
                              borderColor: priorityColors.border,
                            }}
                            textStyle={{ color: priorityColors.text }}
                          >
                            {getPriorityText(task.priority)}
                          </Badge>
                        )}
                      </View>

                      <View style={styles.taskMeta}>
                        <View style={styles.taskTags}>
                          <Badge 
                            style={styles.typeBadge}
                            textStyle={styles.typeBadgeText}
                          >
                            Разовая
                          </Badge>
                          <View style={styles.deadline}>
                            <Clock size={16} color="#6B7280" />
                            <Text style={styles.deadlineText}>
                              {formatDeadline(task.deadline)}
                            </Text>
                          </View>
                        </View>
                        {isCompleted && (
                          <CheckCircle size={20} color="#10B981" />
                        )}
                      </View>

                      {!isCompleted && (
                        <TouchableOpacity
                          style={styles.doneButton}
                          onPress={() => handleMarkAsDone(task.id)}
                        >
                          <Text style={styles.doneButtonText}>Отметить как выполненную</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  sections: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
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
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  typeBadgeText: {
    color: '#374151',
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 14,
    color: '#6B7280',
  },
  doneButton: {
    backgroundColor: '#FF6600',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
