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
import Search from '@/components/Icons/Search';
import { useEmployees, useRefreshOnFocus } from '@/hooks';

export default function EmployeesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Загружаем данные с API
  const { employees, isLoading, error, refetch } = useEmployees();

  // Обновляем при фокусе
  useRefreshOnFocus(refetch);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Фильтрация по поиску
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        (emp.position?.toLowerCase().includes(query) ?? false)
    );
  }, [employees, searchQuery]);

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

  // Показываем загрузку
  if (isLoading && employees.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Показываем ошибку
  if (error && employees.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search size={20} color="#9CA3AF" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Найти сотрудника"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Employee List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.employeeList}>
          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Сотрудники не найдены' : 'Нет сотрудников'}
              </Text>
            </View>
          ) : (
            filteredEmployees.map((employee) => {
              const progress = employee.totalToday > 0 
                ? Math.round((employee.completedToday / employee.totalToday) * 100)
                : 0;
              const initials = employee.name.split(' ').map(n => n[0]).join('');

              return (
                <View key={employee.id} style={styles.employeeCard}>
                  <View style={styles.employeeRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>{employee.name}</Text>
                      <Text style={styles.employeePosition}>
                        {employee.position || 'Сотрудник'}
                      </Text>

                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Прогресс за сегодня</Text>
                          <Text style={styles.progressCount}>
                            {employee.completedToday}/{employee.totalToday} задач
                          </Text>
                        </View>
                        <Progress value={progress} />
                        <Text style={styles.progressPercent}>{progress}% выполнено</Text>
                      </View>

                      {employee.overdue > 0 && (
                        <View style={styles.overdueContainer}>
                          <Text style={styles.overdueText}>
                            ⚠️ {employee.overdue} просроченных задач
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push({
                          pathname: '/(user)/(manager)/team/employee-profile',
                          params: { employeeId: employee.id }
                        })}
                      >
                        <Text style={styles.profileButtonText}>Открыть профиль</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  employeeList: {
    padding: 16,
    gap: 16,
  },
  employeeCard: {
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
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  employeeInfo: {
    flex: 1,
    minWidth: 0,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
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
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdueContainer: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  overdueText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  profileButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
