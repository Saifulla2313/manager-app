import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Иконки-заглушки
const ArrowLeft = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);
const Edit = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);
const MessageSquare = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

export default function RoutineTaskDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const employeeId = params.employeeId as string;

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Проверить уровень запасов",
      completed: true,
      completedAt: "8:15",
    },
    {
      id: "2",
      title: "Убрать барную зону",
      completed: true,
      completedAt: "8:30",
    },
    {
      id: "3",
      title: "Подготовить гарниры",
      completed: true,
      completedAt: "9:00",
    },
    {
      id: "4",
      title: "Заполнить холодильники",
      completed: true,
      completedAt: "9:15",
    },
    {
      id: "5",
      title: "Проверить оборудование",
      completed: false,
      completedAt: undefined,
    },
    {
      id: "6",
      title: "Ознакомиться со специальным меню",
      completed: false,
      completedAt: undefined,
    },
  ]);

  const [comments, setComments] = useState(
    "Все задачи выполняются хорошо. Новая подготовка гарниров быстрее, чем раньше.",
  );

  const employee = {
    name: "Emma Davis",
    position: "Бармен",
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed
                ? new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
            }
          : task,
      ),
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // Компонент чекбокса
  const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && styles.checkboxChecked,
      ]}
      onPress={onPress}
    >
      {checked && <View style={styles.checkboxInner} />}
    </TouchableOpacity>
  );

  // Компонент прогресс-бара
  const Progress = ({ value }: { value: number }) => (
    <View style={styles.progressContainer}>
      <View 
        style={[
          styles.progressFill,
          { width: `${value}%` }
        ]} 
      />
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
            <Text style={styles.headerTitle}>Ежедневный чек-лист</Text>
            <Text style={styles.headerSubtitle}>{employee.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/(user)/(manager)/routine/create-template')}
          >
            <Edit size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.cardTitle}>Прогресс</Text>
              <Text style={styles.progressCount}>
                {completedCount}/{tasks.length} выполнено
              </Text>
            </View>
            <Progress value={progressPercent} />
            <Text style={styles.progressPercent}>
              {progressPercent}% выполнено
            </Text>
          </View>
        </View>

        {/* Task List */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Задачи</Text>
            <View style={styles.tasksList}>
              {tasks.map((task) => (
                <View
                  key={task.id}
                  style={styles.taskItem}
                >
                  <Checkbox
                    checked={task.completed}
                    onPress={() => toggleTask(task.id)}
                  />
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.completedAt && (
                      <Text style={styles.taskTime}>
                        Выполнено в {task.completedAt}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.commentsHeader}>
              <MessageSquare size={20} color="#6366F1" />
              <Text style={styles.cardTitle}>Комментарии</Text>
            </View>
            <TextInput
              style={styles.textarea}
              value={comments}
              onChangeText={setComments}
              placeholder="Добавьте заметки или комментарии..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={false}
            />
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
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 14,
    color: '#6B7280',
  },
  tasksList: {
    gap: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});