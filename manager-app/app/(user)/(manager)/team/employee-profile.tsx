import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import CheckCircle from '@/components/Icons/CheckCircle';
import AlertCircle from '@/components/Icons/AlertCircle';
import Clock from '@/components/Icons/Clock';
import Plus from '@/components/Icons/Plus';
import ArrowLeft from '@/components/Icons/ArrowLeft';
// Иконки-заглушки

const MessageSquare = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);


export default function EmployeeProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const employeeId = params.employeeId as string;

  const [activeTab, setActiveTab] = useState('routine');

  const employee = {
    id: employeeId || '3',
    name: 'Emma Davis',
    position: 'Бармен',
    avatar: 'ED',
    completedToday: 5,
    overdue: 1,
    totalAssigned: 9,
  };

  const routineTasks = [
    { id: '1', title: 'Проверить уровень запасов', status: 'completed', time: '8:15' },
    { id: '2', title: 'Убрать барную зону', status: 'completed', time: '8:30' },
    { id: '3', title: 'Подготовить гарниры', status: 'pending', time: null },
    { id: '4', title: 'Заполнить холодильники', status: 'pending', time: null },
  ];

  const instantTasks = [
    { id: '1', title: 'Обновить меню-доску', priority: 'low', status: 'completed' },
    { id: '2', title: 'Связаться с винным поставщиком', priority: 'high', status: 'overdue' },
    { id: '3', title: 'Обучить нового бармена', priority: 'medium', status: 'in-progress' },
  ];

  const activityLog = [
    { action: 'Завершена задача "Обновить меню-доску"', time: '2 часа назад' },
    { action: 'Добавлен комментарий к "Связаться с поставщиком"', time: '3 часа назад' },
    { action: 'Отмечена "Убрать барную зону" как выполнено', time: '5 часов назад' },
    { action: 'Начало смены', time: '6 часов назад' },
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

  const getStatusColor = (status: 'completed' | 'overdue' | 'in-progress' | 'pending') => {
    switch (status) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'in-progress':
      case 'pending':
        return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Выполнено';
      case 'overdue': return 'Просрочено';
      case 'in-progress': return 'В работе';
      case 'pending': return 'В ожидании';
      default: return status;
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

  // Компонент табов
  const Tabs = ({ value, onValueChange, tabs, children }: any) => {
    return (
      <View>
        <View style={styles.tabsList}>
          {tabs.map((tab: any) => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tabTrigger,
                value === tab.value && styles.activeTab,
              ]}
              onPress={() => onValueChange(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  value === tab.value && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && child.props.value === value
            ? child
            : null
        )}
      </View>
    );
  };

  const TabsContent = ({ value, children }: any) => {
    return <View>{children}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{employee.name}</Text>
        </View>
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sections}>
          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{employee.avatar}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{employee.name}</Text>
                <Text style={styles.profilePosition}>{employee.position}</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color="#10B981" />
                <Text style={styles.statValue}>{employee.completedToday}</Text>
                <Text style={styles.statLabel}>Выполнено</Text>
              </View>
              <View style={styles.statItem}>
                <AlertCircle size={24} color="#EF4444" />
                <Text style={styles.statValue}>{employee.overdue}</Text>
                <Text style={styles.statLabel}>Просрочено</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={24} color="#6366F1" />
                <Text style={styles.statValue}>{employee.totalAssigned}</Text>
                <Text style={styles.statLabel}>Всего</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(user)/(manager)/instant/create-task')}
            >
              <Plus size={16} color="white" />
              <Text style={styles.primaryButtonText}>Назначить задачу</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.outlineButton}
            >
              <MessageSquare size={16} color="#6B7280" />
              <Text style={styles.outlineButtonText}>Отправить отзыв</Text>
            </TouchableOpacity> */}
          </View>

          {/* Tasks Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { value: 'routine', label: 'Регулярные' },
              { value: 'instant', label: 'Разовые' },
            ]}
          >
            <TabsContent value="routine">
              <View style={styles.tasksList}>
                {routineTasks.map((task) => {
                  const statusColors = getStatusColor(task.status);
                  return (
                    <View key={task.id} style={styles.taskCard}>
                      <View style={styles.taskRow}>
                        <View style={styles.taskInfo}>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          {task.time && (
                            <Text style={styles.taskTime}>Выполнено в {task.time}</Text>
                          )}
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
                  );
                })}
              </View>
            </TabsContent>

            <TabsContent value="instant">
              <View style={styles.tasksList}>
                {instantTasks.map((task) => {
                  const priorityColors = getPriorityColor(task.priority);
                  const statusColors = getStatusColor(task.status);
                  return (
                    <View key={task.id} style={styles.taskCard}>
                      <View style={styles.taskHeaderRow}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
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
                      <Badge 
                        style={{
                          backgroundColor: statusColors.bg,
                          borderColor: statusColors.border,
                          alignSelf: 'flex-start',
                        }}
                        textStyle={{ color: statusColors.text }}
                      >
                        {getStatusText(task.status)}
                      </Badge>
                    </View>
                  );
                })}
              </View>
            </TabsContent>
          </Tabs>

          {/* Activity Log */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Журнал активности</Text>
            <View style={styles.activityList}>
              {activityLog.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityAction}>{activity.action}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#6366F1',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabTrigger: {
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    backgroundColor: '#6366F1',
    borderRadius: 4,
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});