import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { organizationsService, type Invite } from '@/lib/api';

export default function InvitesScreen() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [phone, setPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadInvites = useCallback(async () => {
    try {
      const response = await organizationsService.getInvites();
      if (response.data?.invites) {
        setInvites(response.data.invites);
      }
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInvites();
  };

  const handleCreateInvite = async () => {
    if (!phone.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return;
    }

    // Простая валидация номера
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    setIsCreating(true);

    try {
      const response = await organizationsService.createInvite({ phone: cleanPhone });
      
      if (response.data?.invite) {
        Alert.alert(
          '✅ Приглашение отправлено!', 
          `Код: ${response.data.invite.code}\n\nСообщение отправлено в WhatsApp на номер ${cleanPhone}`,
          [{ text: 'OK' }]
        );
        setPhone('');
        loadInvites();
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать приглашение');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInvite = (invite: Invite) => {
    Alert.alert(
      'Удалить приглашение?',
      `Код: ${invite.code}\nТелефон: ${invite.phone}`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await organizationsService.deleteInvite(invite.id);
              loadInvites();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить приглашение');
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'ACCEPTED': return '#10B981';
      case 'EXPIRED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'ACCEPTED': return 'Принято';
      case 'EXPIRED': return 'Истекло';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6600" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Приглашения</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Create Invite Form */}
        <View style={styles.createCard}>
          <Text style={styles.createTitle}>📨 Пригласить сотрудника</Text>
          <Text style={styles.createDescription}>
            Введите номер телефона. Сотрудник получит код в WhatsApp.
          </Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.phoneInput}
              placeholder="+7 999 123 45 67"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isCreating}
            />
            <TouchableOpacity 
              style={[styles.sendButton, isCreating && styles.sendButtonDisabled]}
              onPress={handleCreateInvite}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Отправить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Invites List */}
        <Text style={styles.sectionTitle}>
          История приглашений ({invites.length})
        </Text>

        {invites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Пока нет приглашений</Text>
          </View>
        ) : (
          invites.map((invite) => (
            <TouchableOpacity 
              key={invite.id} 
              style={styles.inviteCard}
              onLongPress={() => invite.status === 'PENDING' && handleDeleteInvite(invite)}
            >
              <View style={styles.inviteHeader}>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>Код:</Text>
                  <Text style={styles.codeValue}>{invite.code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invite.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(invite.status) }]}>
                    {getStatusText(invite.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.phoneText}>📱 {invite.phone}</Text>
              
              {invite.usedBy && (
                <Text style={styles.usedByText}>
                  ✅ Принял: {invite.usedBy.name} ({invite.usedBy.email})
                </Text>
              )}
              
              <View style={styles.inviteFooter}>
                <Text style={styles.dateText}>
                  Создано: {new Date(invite.createdAt).toLocaleDateString('ru-RU')}
                </Text>
                {invite.status === 'PENDING' && (
                  <Text style={styles.expiresText}>
                    Истекает: {new Date(invite.expiresAt).toLocaleDateString('ru-RU')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  createDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#FF6600',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  inviteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  codeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  phoneText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  usedByText: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 8,
  },
  inviteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  expiresText: {
    fontSize: 12,
    color: '#F59E0B',
  },
});
