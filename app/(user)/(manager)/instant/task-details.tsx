import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AlertCircle from '@/components/Icons/AlertCircle';

// Иконки-заглушки
const ArrowLeft = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);
const Clock = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);


export default function InstantTasksManager() {
  const router = useRouter();

  const tasks = [
    {
      id: '1',
      title: 'Починить сломанный льдогенератор',
      priority: 'high' as const,
      employee: 'Mike Chen',
      deadline: '2 часа',
      status: 'in-progress' as const,
    },
    {
      id: '2',
      title: 'Заказать винные бокалы на замену',
      priority: 'medium' as const,
      employee: 'Sarah Johnson',
      deadline: '1 день',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'Обновить меню-доску',
      priority: 'low' as const,
      employee: 'Emma Davis',
      deadline: '3 дня',
      status: 'done' as const,
    },
    {
      id: '4',
      title: 'Запланировать собрание персонала',
      priority: 'high' as const,
      employee: 'James Wilson',
      deadline: '4 часа',
      status: 'in-progress' as const,
    },
    {
      id: '5',
      title: 'Убрать складское помещение',
      priority: 'medium' as const,
      employee: 'Lisa Anderson',
      deadline: '2 дня',
      status: 'in-progress' as const,
    },
    {
      id: '6',
      title: 'Связаться с поставщиком',
      priority: 'high' as const,
      employee: 'Sarah Johnson',
      deadline: '6 часов',
      status: 'in-progress' as const,
    },
  ];

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'medium':
        return { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74' };
      case 'low':
        return { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' };
    }
  };

  const getStatusColor = (status: 'in-progress' | 'done') => {
    return status === 'done'
      ? { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' }
      : { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
  };

  const getPriorityText = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
    }
  };

  const getStatusText = (status: 'in-progress' | 'done') => {
    return status === 'in-progress' ? 'В работе' : 'Выполнено';
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: '/(user)/(manager)/instant/create-task',
      params: { taskId }
    });
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
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Разовые задачи</Text>
            <Text style={styles.headerSubtitle}>Задачи, которые появляются в реальном времени</Text>
          </View>
        </View>
      </View>

      {/* Task List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskList}>
          {tasks.map((task) => {
            const priorityColors = getPriorityColor(task.priority);
            const statusColors = getStatusColor(task.status);
            const initials = task.employee.split(' ').map(n => n[0]).join('');

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
                    <Text style={styles.employeeName}>{task.employee}</Text>
                  </View>

                  <View style={styles.taskMeta}>
                    <View style={styles.deadline}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.deadlineText}>{task.deadline}</Text>
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

                {task.priority === 'high' && task.status !== 'done' && (
                  <View style={styles.priorityAlert}>
                    <AlertCircle size={16} color="#DC2626" />
                    <Text style={styles.priorityAlertText}>Высокий приоритет - требует внимания</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(user)/(manager)/instant/create-task')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  taskList: {
    padding: 16,
    gap: 16,
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
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});