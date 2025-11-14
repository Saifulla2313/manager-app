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
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Иконки-заглушки
const ImageIcon = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);
const X = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

export default function CreateInstantTask() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  const employees = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Mike Chen' },
    { id: '3', name: 'Emma Davis' },
    { id: '4', name: 'James Wilson' },
    { id: '5', name: 'Lisa Anderson' },
  ];

  const priorities = [
    { value: 'low', label: 'Низкий', color: '#3B82F6' },
    { value: 'medium', label: 'Средний', color: '#F59E0B' },
    { value: 'high', label: 'Высокий', color: '#EF4444' },
  ];

  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к фотографиям');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    // Create task logic here
    router.back();
  };

  const selectedEmployeeName = employees.find(emp => emp.id === selectedEmployee)?.name || '';
  const selectedPriority = priorities.find(p => p.value === priority);

  return (
    <View style={styles.container}>
      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Task Info Card */}
          <View style={styles.card}>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Название задачи</Text>
                <TextInput
                  style={styles.input}
                  placeholder="например, Починить оборудование"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Описание</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Опишите детали задачи..."
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Priority & Employee Card */}
          <View style={styles.card}>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Приоритет</Text>
                <TouchableOpacity
                  style={styles.selectTrigger}
                  onPress={() => setShowPriorityModal(true)}
                >
                  {selectedPriority ? (
                    <View style={styles.priorityOption}>
                      <View 
                        style={[
                          styles.priorityDot,
                          { backgroundColor: selectedPriority.color }
                        ]} 
                      />
                      <Text style={styles.selectValue}>{selectedPriority.label}</Text>
                    </View>
                  ) : (
                    <Text style={styles.selectPlaceholder}>Выберите приоритет</Text>
                  )}
                </TouchableOpacity>
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
            </View>
          </View>

          {/* Deadline Card */}
          <View style={styles.card}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Срок выполнения</Text>
              <View style={styles.deadlineRow}>
                <View style={styles.deadlineInput}>
                  <Text style={styles.deadlineLabel}>Дата</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={deadlineDate}
                    onChangeText={setDeadlineDate}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.deadlineInput}>
                  <Text style={styles.deadlineLabel}>Время</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    value={deadlineTime}
                    onChangeText={setDeadlineTime}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Photos Card */}
          <View style={styles.card}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Прикрепить фото</Text>
              <TouchableOpacity
                style={styles.photoUploadButton}
                onPress={handlePhotoUpload}
              >
                <ImageIcon size={20} color="#9CA3AF" />
                <Text style={styles.photoUploadText}>Добавить фото</Text>
              </TouchableOpacity>
              
              {photos.length > 0 && (
                <View style={styles.photosGrid}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <X size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreate}
            >
              <Text style={styles.primaryButtonText}>
                {taskId ? 'Обновить задачу' : 'Создать задачу'}
              </Text>
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
            <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
              <Text style={styles.modalClose}>Готово</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedEmployee(item.id);
                  setShowEmployeeModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                {selectedEmployee === item.id && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Priority Selection Modal */}
      <Modal
        visible={showPriorityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите приоритет</Text>
            <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
              <Text style={styles.modalClose}>Готово</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={priorities}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setPriority(item.value);
                  setShowPriorityModal(false);
                }}
              >
                <View style={styles.priorityOption}>
                  <View 
                    style={[
                      styles.priorityDot,
                      { backgroundColor: item.color }
                    ]} 
                  />
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </View>
                {priority === item.value && (
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
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deadlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deadlineInput: {
    flex: 1,
    gap: 8,
  },
  deadlineLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  photoUploadText: {
    fontSize: 16,
    color: '#6B7280',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 4,
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
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