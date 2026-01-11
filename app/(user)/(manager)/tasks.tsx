import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Plus from '@/components/Icons/Plus';
import AlertCircle from '@/components/Icons/AlertCircle';
import Clock from '@/components/Icons/Clock';
import { useTasks, useEmployees, useRefreshOnFocus } from '@/hooks';
import type { TaskPriority, TaskStatus } from '@/lib/api/types';

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

export default function TasksManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'instant' | 'routine'>('instant');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Загружаем данные с API
  const { tasks, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();
  const { employees, isLoading: employeesLoading, refetch: refetchEmployees } = useEmployees();

  // Обновляем данные при фокусе
  useRefreshOnFocus(() => {
    refetchTasks();
    refetchEmployees();
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchEmployees()]);
    setRefreshing(false);
  };

  // Фильтрация задач по поиску
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.assignee.name.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Фильтрация сотрудников по поиску
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        (emp.position?.toLowerCase().includes(query) ?? false)
    );
  }, [employees, searchQuery]);

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

  const getStatusColor = (status: TaskStatus) => {
    return status === 'DONE'
      ? { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' }
      : { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH': return 'Высокий';
      case 'MEDIUM': return 'Средний';
      case 'LOW': return 'Низкий';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    return status === 'IN_PROGRESS' ? 'В работе' : 'Выполнено';
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: '/(user)/(manager)/instant/create-task',
      params: { taskId }
    });
  };

  const handleEmployeePress = (employeeId: string) => {
    router.push({
      pathname: '/(user)/(manager)/routine/task-details',
      params: { employeeId }
    });
  };

  // Компонент бейджа
  const Badge = ({ children, style, textStyle }: any) => (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>{children}</Text>
    </View>
  );

  // Компонент прогресс-бара
  const Progress = ({ value }: { value: number }) => (
    <View style={styles.progressContainer}>
      <View 
        style={[
          styles.progressFill,
          { width: `${Math.min(value, 100)}%` }
        ]} 
      />
    </View>
  );

  // Компонент табов
  const Tabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'instant' && styles.activeTab
        ]}
        onPress={() => setActiveTab('instant')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'instant' && styles.activeTabText
        ]}>
          Разовые задачи
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'routine' && styles.activeTab
        ]}
        onPress={() => setActiveTab('routine')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'routine' && styles.activeTabText
        ]}>
          Регулярные задачи
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Компонент списка разовых задач
  const InstantTasksList = () => {
    if (tasksLoading && tasks.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    if (tasksError && tasks.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={32} color="#EF4444" />
          <Text style={styles.errorText}>Ошибка загрузки</Text>
        </View>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Задачи не найдены' : 'Нет задач'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.taskList}>
        {filteredTasks.map((task) => {
          const priorityColors = getPriorityColor(task.priority);
          const statusColors = getStatusColor(task.status);
          const initials = task.assignee.name.split(' ').map(n => n[0]).join('');

          return (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleTaskPress(task.id)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
                <Badge 
                  style={{
                    backgroundColor: priorityColors.bg,
                    borderColor: priorityColors.border,
                  }}
                  textStyle={{ color: priorityColors.text }}
                >
                  {getPriorityText(task.priority)}
                </Badge>
              </View>

              <View style={styles.taskDetails}>
                <View style={styles.employeeInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <Text style={styles.employeeName}>{task.assignee.name}</Text>
                </View>

                <View style={styles.taskMeta}>
                  <View style={styles.deadline}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.deadlineText}>{formatDeadline(task.deadline)}</Text>
                  </View>
                  <Badge 
                    style={{
                      backgroundColor: statusColors.bg,
                      borderColor: statusColors.border,
                    }}
                    textStyle={{ color: statusColors.text }}
                  >
                    {getStatusText(task.status)}
                  </Badge>
                </View>
              </View>

              {task.priority === 'HIGH' && task.status !== 'DONE' && (
                <View style={styles.priorityAlert}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={styles.priorityAlertText}>Высокий приоритет - требует внимания</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Компонент списка регулярных задач (сотрудники с прогрессом)
  const RoutineTasksList = () => {
    if (employeesLoading && employees.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    if (filteredEmployees.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Сотрудники не найдены' : 'Нет сотрудников'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.taskList}>
        {filteredEmployees.map((employee) => {
          const progress = employee.totalToday > 0 
            ? Math.round((employee.completedToday / employee.totalToday) * 100) 
            : 0;

          return (
            <TouchableOpacity
              key={employee.id}
              style={styles.employeeCard}
              onPress={() => handleEmployeePress(employee.id)}
            >
              <View style={styles.employeeHeader}>
                <View style={styles.employeeInfoBlock}>
                  <Text style={styles.employeeNameLarge}>{employee.name}</Text>
                  <Text style={styles.employeePosition}>{employee.position || 'Сотрудник'}</Text>
                </View>
                <View style={styles.employeeStats}>
                  <Text style={styles.employeeCount}>
                    {employee.completedToday}/{employee.totalToday}
                  </Text>
                  <Text style={styles.employeeLabel}>Задач</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Прогресс за сегодня</Text>
                  <Text style={styles.progressPercent}>{progress}%</Text>
                </View>
                <Progress value={progress} />
              </View>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleEmployeePress(employee.id)}
              >
                <Text style={styles.detailsButtonText}>Подробнее</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Найти задачу..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <Tabs />

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'instant' ? <InstantTasksList /> : <RoutineTasksList />}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(
          activeTab === 'instant' 
            ? '/(user)/(manager)/instant/create-task'
            : '/(user)/(manager)/routine/create-template'
        )}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  taskList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 80,
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
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  taskDetails: {
    gap: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  employeeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  priorityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginTop: 12,
  },
  priorityAlertText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  employeeCard: {
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
    marginBottom: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeInfoBlock: {
    flex: 1,
  },
  employeeNameLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 14,
    color: '#6B7280',
  },
  employeeStats: {
    alignItems: 'flex-end',
  },
  employeeCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  employeeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  detailsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
