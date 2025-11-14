import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Search from '@/components/Icons/Search';



export default function EmployeesList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const employees = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Официант',
      avatar: 'SJ',
      completedToday: 8,
      totalToday: 10,
      progress: 80,
    },
    {
      id: '2',
      name: 'Mike Chen',
      position: 'Повар',
      avatar: 'MC',
      completedToday: 12,
      totalToday: 12,
      progress: 100,
    },
    {
      id: '3',
      name: 'Emma Davis',
      position: 'Бармен',
      avatar: 'ED',
      completedToday: 5,
      totalToday: 9,
      progress: 56,
    },
    {
      id: '4',
      name: 'James Wilson',
      position: 'Официант',
      avatar: 'JW',
      completedToday: 7,
      totalToday: 10,
      progress: 70,
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      position: 'Хостес',
      avatar: 'LA',
      completedToday: 6,
      totalToday: 8,
      progress: 75,
    },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.employeeList}>
          {filteredEmployees.map((employee) => (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{employee.avatar}</Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.name}</Text>
                  <Text style={styles.employeePosition}>{employee.position}</Text>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Прогресс за сегодня</Text>
                      <Text style={styles.progressCount}>
                        {employee.completedToday}/{employee.totalToday} задач
                      </Text>
                    </View>
                    <Progress value={employee.progress} />
                    <Text style={styles.progressPercent}>{employee.progress}% выполнено</Text>
                  </View>

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
          ))}

          {filteredEmployees.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Сотрудники не найдены</Text>
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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