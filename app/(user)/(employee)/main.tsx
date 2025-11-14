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

const Clock = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);


export default function EmployeeMainView() {
  const router = useRouter();

  const todayTasks = [
    {
      id: '1',
      title: 'Проверить уровень запасов',
      type: 'Регулярная',
      deadline: 'Ежедневный чек-лист',
      completed: true,
    },
    {
      id: '2',
      title: 'Связаться с винным поставщиком',
      type: 'Разовая',
      deadline: '2 часа',
      priority: 'high',
      completed: false,
    },
    {
      id: '3',
      title: 'Убрать барную зону',
      type: 'Регулярная',
      deadline: 'Ежедневный чек-лист',
      completed: true,
    },
    {
      id: '4',
      title: 'Обучить нового бармена',
      type: 'Разовая',
      deadline: 'Завтра',
      priority: 'medium',
      completed: false,
    },
  ];

  const managerNotes = [
    { message: 'Отличная работа с новым коктейльным меню!', time: 'Вчера' },
    { message: 'Пожалуйста, уделите внимание обучению нового сотрудника на этой неделе', time: '2 дня назад' },
  ];

  const stats = {
    completedToday: 3,
    pendingToday: 2,
    overdue: 1,
  };

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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
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
    // Mark as done logic here
    console.log('Mark task as done:', taskId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои задачи</Text>
        <Text style={styles.headerSubtitle}>С возвращением, Emma!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sections}>
          {/* Stats */}
          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={32} color="#10B981" />
                <Text style={styles.statValue}>{stats.completedToday}</Text>
                <Text style={styles.statLabel}>Готово</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={32} color="#1E40AF" />
                <Text style={styles.statValue}>{stats.pendingToday}</Text>
                <Text style={styles.statLabel}>В работе</Text>
              </View>
              <View style={styles.statItem}>
                <AlertCircle size={32} color="#EF4444" />
                <Text style={styles.statValue}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Просрочено</Text>
              </View>
            </View>
          </View>

          {/* Manager Notes */}
          {managerNotes.length > 0 && (
            <View style={[styles.card, styles.notesCard]}>
              <Text style={styles.cardTitle}>Заметки менеджера</Text>
              <View style={styles.notesList}>
                {managerNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteMessage}>{note.message}</Text>
                    <Text style={styles.noteTime}>{note.time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Today's Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Задачи на сегодня</Text>
            <View style={styles.tasksList}>
              {todayTasks.map((task) => {
                const priorityColors = task.priority ? getPriorityColor(task.priority) : null;
                
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => handleTaskPress(task.id)}
                  >
                    <View style={styles.taskHeader}>
                      <Text style={[
                        styles.taskTitle,
                        task.completed && styles.taskCompleted
                      ]}>
                        {task.title}
                      </Text>
                      {!task.completed && task.priority && (
                        <Badge 
                          style={{
                            backgroundColor: priorityColors!.bg,
                            borderColor: priorityColors!.border,
                          }}
                          textStyle={{ color: priorityColors!.text }}
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
                          {task.type}
                        </Badge>
                        <View style={styles.deadline}>
                          <Clock size={16} color="#6B7280" />
                          <Text style={styles.deadlineText}>{task.deadline}</Text>
                        </View>
                      </View>
                      {task.completed && (
                        <CheckCircle size={20} color="#10B981" />
                      )}
                    </View>

                    {!task.completed && (
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
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  noteMessage: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  noteTime: {
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