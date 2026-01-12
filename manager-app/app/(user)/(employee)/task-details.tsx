import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import CheckCircle from '@/components/Icons/CheckCircle';
import AlertCircle from '@/components/Icons/AlertCircle';
import Clock from '@/components/Icons/Clock';
import ArrowLeft from '@/components/Icons/ArrowLeft';
// Иконки-заглушки


const MessageSquare = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

const ImageIcon = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);
const X = ({ size = 24, color = "#000" }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

export default function TaskDetailsEmployee() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  const [status, setStatus] = useState<'in-progress' | 'done'>('in-progress');
  const [comment, setComment] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [comments, setComments] = useState([
    { author: 'Менеджер', message: 'Пожалуйста, уделите приоритет этой задаче сегодня', time: '2 часа назад' },
    { author: 'Вы', message: 'Я выполню это к концу смены', time: '1 час назад' },
  ]);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const task = {
    id: taskId || '2',
    title: 'Связаться с винным поставщиком',
    description: 'Позвоните винному поставщику, чтобы подтвердить доставку на следующую неделю. Нужно убедиться, что у нас достаточно Пино Нуар и Шардоне на выходные.',
    priority: 'high' as const,
    deadline: 'Сегодня, 17:00',
    type: 'Разовая',
    assignedBy: 'Sarah Johnson',
  };

  const handleStatusChange = (newStatus: 'in-progress' | 'done') => {
    setStatus(newStatus);
    setShowStatusModal(false);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      setComments([...comments, { author: 'Вы', message: comment, time: 'Только что' }]);
      setComment('');
    }
  };

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
        setCompletionPhotos([...completionPhotos, ...newPhotos]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  const removePhoto = (index: number) => {
    setCompletionPhotos(completionPhotos.filter((_, i) => i !== index));
  };

  const handleMarkAsDone = () => {
    setStatus('done');
    Alert.alert('Успех', 'Задача отмечена как выполненная!');
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

  const getStatusText = (status: string) => {
    return status === 'done' ? 'Выполнено' : 'В работе';
  };

  // Компонент бейджа
  const Badge = ({ children, style, textStyle }: any) => (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>{children}</Text>
    </View>
  );

  const priorityColors = getPriorityColor(task.priority);

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
          <Text style={styles.headerTitle}>Детали задачи</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sections}>
          {/* Task Info */}
          <View style={styles.card}>
            <View style={styles.taskHeader}>
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

            <Text style={styles.taskDescription}>{task.description}</Text>

            <View style={styles.taskDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Тип</Text>
                <Badge 
                  style={styles.typeBadge}
                  textStyle={styles.typeBadgeText}
                >
                  {task.type}
                </Badge>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Срок выполнения</Text>
                <View style={styles.deadline}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.deadlineText}>{task.deadline}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Назначил</Text>
                <Text style={styles.detailValue}>{task.assignedBy}</Text>
              </View>
            </View>
          </View>

          {/* Priority Alert */}
          {task.priority === 'high' && status !== 'done' && (
            <View style={[styles.card, styles.priorityAlert]}>
              <View style={styles.alertContent}>
                <AlertCircle size={20} color="#DC2626" />
                <View>
                  <Text style={styles.alertTitle}>Задача с высоким приоритетом</Text>
                  <Text style={styles.alertMessage}>Требует немедленного внимания</Text>
                </View>
              </View>
            </View>
          )}

          {/* Status */}
          <View style={styles.card}>
            <View style={styles.statusSection}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>Статус</Text>
                <Badge 
                  style={
                    status === 'done' 
                      ? { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }
                      : { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' }
                  }
                  textStyle={
                    status === 'done' 
                      ? { color: '#065F46' }
                      : { color: '#374151' }
                  }
                >
                  {getStatusText(status)}
                </Badge>
              </View>

              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowStatusModal(true)}
              >
                <Text style={styles.selectValue}>Изменить статус</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Completion Photos */}
          {status !== 'done' && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Фото выполнения</Text>
              <Text style={styles.sectionSubtitle}>Прикрепите фото для подтверждения выполнения</Text>
              
              <View style={styles.photosSection}>
                <TouchableOpacity
                  style={styles.photoUploadButton}
                  onPress={handlePhotoUpload}
                >
                  <ImageIcon size={20} color="#9CA3AF" />
                  <Text style={styles.photoUploadText}>Добавить фото</Text>
                </TouchableOpacity>
                
                {completionPhotos.length > 0 && (
                  <View style={styles.photosGrid}>
                    {completionPhotos.map((photo, index) => (
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
          )}

          {/* Comments */}
          <View style={styles.card}>
            <View style={styles.commentsHeader}>
              <MessageSquare size={20} color="#1E40AF" />
              <Text style={styles.sectionTitle}>Комментарии</Text>
            </View>

            <View style={styles.commentsList}>
              {comments.map((comment, index) => (
                <View
                  key={index}
                  style={[
                    styles.commentBubble,
                    comment.author === 'Вы' ? styles.ownComment : styles.managerComment
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentMessage}>{comment.message}</Text>
                </View>
              ))}
            </View>

            <View style={styles.commentInputSection}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Отправить сообщение менеджеру..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !comment.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendComment}
                disabled={!comment.trim()}
              >
                <Text style={styles.sendButtonText}>Отправить комментарий</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button */}
          {status !== 'done' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleMarkAsDone}
            >
              <CheckCircle size={20} color="white" />
              <Text style={styles.primaryButtonText}>Отметить как выполненную</Text>
            </TouchableOpacity>
          )}

          {status === 'done' && (
            <View style={[styles.card, styles.successCard]}>
              <View style={styles.successContent}>
                <CheckCircle size={20} color="#059669" />
                <Text style={styles.successText}>Задача выполнена! Отличная работа!</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Изменить статус</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Text style={styles.modalClose}>Готово</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => handleStatusChange('in-progress')}
          >
            <Text style={styles.modalItemText}>В работе</Text>
            {status === 'in-progress' && <View style={styles.selectedIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => handleStatusChange('done')}
          >
            <Text style={styles.modalItemText}>Выполнено</Text>
            {status === 'done' && <View style={styles.selectedIndicator} />}
          </TouchableOpacity>
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
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
  taskDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  taskDetails: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
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
    color: '#111827',
    fontWeight: '500',
  },
  priorityAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertTitle: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#DC2626',
  },
  statusSection: {
    gap: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  photosSection: {
    gap: 16,
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
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  commentsList: {
    gap: 12,
    marginBottom: 16,
  },
  commentBubble: {
    padding: 16,
    borderRadius: 12,
  },
  ownComment: {
    backgroundColor: '#DBEAFE',
    marginLeft: 32,
  },
  managerComment: {
    backgroundColor: '#F3F4F6',
    marginRight: 32,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputSection: {
    gap: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: '500',
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
    color: '#1E40AF',
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
    backgroundColor: '#1E40AF',
    borderRadius: 4,
  },
});