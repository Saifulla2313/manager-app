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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ArrowLeft from '@/components/Icons/ArrowLeft';
import Bell from '@/components/Icons/Bell';
import Globe from '@/components/Icons/Globe';
import ChevronRight from '@/components/Icons/ChevronRight';
import LogOut from '@/components/Icons/LogOut';
import User from '@/components/Icons/User';


export default function SettingsScreen() {
  const router = useRouter();
  const { user, userRole, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Используем реальные данные из API
  const profile = {
    name: user?.name || 'Пользователь',
    role: user?.position || (userRole === 'MANAGER' ? 'Менеджер' : 'Сотрудник'),
    phone: '+7 (999) 123-4567', // TODO: добавить телефон в API
    email: user?.email || '',
  };

  const languages = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
  ];

  const selectedLanguage = languages.find(lang => lang.value === language);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    // Navigation is handled by AuthContext
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sections}>
          {/* Profile Section */}
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <User size={32} color="white" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileRole}>{profile.role}</Text>
              </View>
            </View>

            <View style={styles.profileFields}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  style={styles.input}
                  value={profile.name}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Должность</Text>
                <TextInput
                  style={styles.input}
                  value={profile.role}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Телефон</Text>
                <TextInput
                  style={styles.input}
                  value={profile.phone}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Notification Preferences */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color="#FF6600" />
              <Text style={styles.sectionTitle}>Настройки уведомлений</Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Push-уведомления</Text>
                  <Text style={styles.settingDescription}>Получать уведомления на устройство</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#FF6600' }}
                  thumbColor={notificationsEnabled ? 'white' : 'white'}
                />
              </View>

              <View style={[styles.settingItem, styles.settingItemBorder]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Звук</Text>
                  <Text style={styles.settingDescription}>Воспроизводить звук для уведомлений</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#FF6600' }}
                  thumbColor={soundEnabled ? 'white' : 'white'}
                />
              </View>

              <View style={[styles.settingItem, styles.settingItemBorder]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Email уведомления</Text>
                  <Text style={styles.settingDescription}>Получать обновления по email</Text>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#D1D5DB', true: '#FF6600' }}
                  thumbColor={emailNotifications ? 'white' : 'white'}
                />
              </View>
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color="#FF6600" />
              <Text style={styles.sectionTitle}>Настройки приложения</Text>
            </View>

            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowLanguageModal(true)}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Язык</Text>
                  <Text style={styles.settingDescription}>Выберите язык приложения</Text>
                </View>
                <View style={styles.languageSelector}>
                  <Text style={styles.languageValue}>{selectedLanguage?.label}</Text>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Team Management */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#FF6600" />
              <Text style={styles.sectionTitle}>Управление командой</Text>
            </View>

            <View style={styles.optionsList}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => router.push('/(user)/(manager)/invites')}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>📨 Приглашения</Text>
                  <Text style={styles.optionDescription}>Пригласить сотрудников по WhatsApp</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.card}>
            <View style={styles.optionsList}>
              <TouchableOpacity style={styles.optionItem}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Политика конфиденциальности</Text>
                  <Text style={styles.optionDescription}>Ознакомьтесь с нашей политикой</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.optionItem, styles.optionItemBorder]}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Условия использования</Text>
                  <Text style={styles.optionDescription}>Посмотреть условия и положения</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.optionItem, styles.optionItemBorder]}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>О приложении</Text>
                  <Text style={styles.optionDescription}>Версия 1.0.0</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите язык</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalClose}>Готово</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={languages}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setLanguage(item.value);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.label}</Text>
                {language === item.value && (
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
    backgroundColor: '#FF6600',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileRole: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileFields: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
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
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  settingsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageValue: {
    fontSize: 16,
    color: '#111827',
  },
  optionsList: {
    gap: 0,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
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
    color: '#FF6600',
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
    backgroundColor: '#FF6600',
    borderRadius: 4,
  },
});