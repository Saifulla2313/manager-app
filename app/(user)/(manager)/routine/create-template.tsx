import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import ArrowLeft from '@/components/Icons/ArrowLeft';
import Plus from '@/components/Icons/Plus';

// Иконки-заглушки

const X = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

export default function RoutineTemplateCreation() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [repeatTime, setRepeatTime] = useState('09:00');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const employees = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Mike Chen' },
    { id: '3', name: 'Emma Davis' },
    { id: '4', name: 'James Wilson' },
    { id: '5', name: 'Lisa Anderson' },
  ];

  const addTask = () => {
    setTasks([...tasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Save template logic here
    router.back();
  };

  const selectedEmployeeName = employees.find(emp => emp.id === selectedEmployee)?.name || '';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Template Info Card */}
          <View style={styles.card}>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Название шаблона</Text>
                <TextInput
                  style={styles.input}
                  placeholder="например, Утренний чек-лист"
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Назначить сотруднику</Text>
                <TouchableOpacity
                  style={styles.selectTrigger}
                  onPress={() => setShowEmployeeModal(true)}
                >
                  <Text style={selectedEmployee ? styles.selectValue : styles.selectPlaceholder}>
                    {selectedEmployeeName || 'Выберите сотрудника'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Повторять каждое утро в</Text>
                <TextInput
                  style={styles.input}
                  value={repeatTime}
                  onChangeText={setRepeatTime}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Tasks Card */}
          <View style={styles.card}>
            <View style={styles.tasksHeader}>
              <Text style={styles.label}>Ежедневные задачи</Text>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={addTask}
              >
                <Plus size={16} color="#6366F1" />
                <Text style={styles.addTaskText}>Добавить</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tasksList}>
              {tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <TextInput
                    style={styles.taskInput}
                    placeholder={`Задача ${index + 1}`}
                    value={task}
                    onChangeText={(value) => updateTask(index, value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  {tasks.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTaskButton}
                      onPress={() => removeTask(index)}
                    >
                      <X size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSave}
            >
              <Text style={styles.primaryButtonText}>Сохранить шаблон</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.back()}
            >
              <Text style={styles.outlineButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Employee Selection Modal */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите сотрудника</Text>
            <TouchableOpacity
              onPress={() => setShowEmployeeModal(false)}
            >
              <Text style={styles.modalClose}>Готово</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.employeeItem}
                onPress={() => {
                  setSelectedEmployee(item.id);
                  setShowEmployeeModal(false);
                }}
              >
                <Text style={styles.employeeName}>{item.name}</Text>
                {selectedEmployee === item.id && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
  formContainer: {
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
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  selectTrigger: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  selectValue: {
    fontSize: 16,
    color: '#111827',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTaskText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  removeTaskButton: {
    padding: 8,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalClose: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  employeeName: {
    fontSize: 16,
    color: '#111827',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
});