import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import CheckCircle from '@/components/Icons/CheckCircle';
import AlertCircle from '@/components/Icons/AlertCircle';
import Plus from '@/components/Icons/Plus';
import ArrowRight from '@/components/Icons/ArrowRight';
import Clock from '@/components/Icons/Clock';



export default function ManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('routine');

  const stats = {
    completedToday: 24,
    overdue: 3,
    pending: 12,
  };

  const recentActivity = [
    { employee: 'Sarah Johnson', action: 'завершил утренний чек-лист', time: '10 минут назад' },
    { employee: 'Mike Chen', action: 'отметил задачу как выполненную', time: '25 минут назад' },
    { employee: 'Emma Davis', action: 'добавила комментарий', time: '1 час назад' },
  ];

  const handleNavigate = (screen: string) => {
    router.push(screen as any);
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Главная</Text>
        <Text style={styles.headerSubtitle}>Управление задачами команды</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Статистика</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <CheckCircle size={32} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.completedToday}</Text>
                <Text style={styles.statLabel}>Выполнено</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <AlertCircle size={32} color="#EF4444" />
                </View>
                <Text style={styles.statValue}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Просрочено</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Clock size={32} color="#6366F1" />
                </View>
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={styles.statLabel}>В работе</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Быстрые действия</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => handleNavigate('/(user)/(manager)/instant/create-task')}
              >
                <View style={styles.buttonContent}>
                  <Plus size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Добавить задачу</Text>
                </View>
                <ArrowRight size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.outlineButton}
                onPress={() => handleNavigate('/(user)/(manager)/routine/create-template')}
              >
                <View style={styles.buttonContent}>
                  <Plus size={20} color="#6B7280" />
                  <Text style={styles.outlineButtonText}>Создать шаблон</Text>
                </View>
                <ArrowRight size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Management Tabs */}
        <View style={styles.section}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { value: 'routine', label: 'Регулярные' },
              { value: 'instant', label: 'Разовые' },
              { value: 'employees', label: 'Команда' },
            ]}
          >
            <TabsContent value="routine">
              <View style={styles.card}>
                <View style={styles.tabHeader}>
                  <Text style={styles.cardTitle}>Регулярные задачи</Text>
                  <TouchableOpacity
                    onPress={() => handleNavigate('/(user)/(manager)/tasks')}
                  >
                    <Text style={styles.linkText}>Все</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tabDescription}>3 сотрудника с активными чек-листами</Text>
              </View>
            </TabsContent>

            <TabsContent value="instant">
              <View style={styles.card}>
                <View style={styles.tabHeader}>
                  <Text style={styles.cardTitle}>Разовые задачи</Text>
                  <TouchableOpacity
                    onPress={() => handleNavigate('/(user)/(manager)/tasks')}
                  >
                    <Text style={styles.linkText}>Все</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tabDescription}>8 активных задач назначено</Text>
              </View>
            </TabsContent>

            <TabsContent value="employees">
              <View style={styles.card}>
                <View style={styles.tabHeader}>
                  <Text style={styles.cardTitle}>Команда</Text>
                  <TouchableOpacity
                    onPress={() => handleNavigate('/(user)/(manager)/team')}
                  >
                    <Text style={styles.linkText}>Все</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tabDescription}>5 сотрудников в смене сегодня</Text>
              </View>
            </TabsContent>
          </Tabs>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Последняя активность</Text>
            <View style={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityEmployee}>{activity.employee}</Text>
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  outlineButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 16,
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
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  tabDescription: {
    fontSize: 14,
    color: '#6B7280',
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
  activityEmployee: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activityAction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});