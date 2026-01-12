import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { organizationsService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const [step, setStep] = useState<'type' | 'company' | 'invite'>('type');
  const [organizationName, setOrganizationName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [position, setPosition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSession } = useAuth();

  const handleCreateCompany = async () => {
    if (!organizationName.trim()) {
      Alert.alert('Ошибка', 'Введите название компании');
      return;
    }
    if (!managerName.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await organizationsService.createOrganization({
        organizationName: organizationName.trim(),
        managerName: managerName.trim(),
        managerEmail: email.trim(),
        managerPassword: password,
        managerPhone: phone.trim() || undefined,
      });

      // Сохраняем сессию
      await setSession(response.token, response.user);
      
      Alert.alert(
        'Успешно!', 
        `Компания "${response.organization.name}" создана. Теперь вы можете приглашать сотрудников.`
      );
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать компанию');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterByInvite = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Ошибка', 'Введите код приглашения');
      return;
    }
    if (!managerName.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await organizationsService.registerByInvite({
        inviteCode: inviteCode.trim().toUpperCase(),
        name: managerName.trim(),
        email: email.trim(),
        password: password,
        position: position.trim() || undefined,
      });

      // Сохраняем сессию
      await setSession(response.token, response.user);
      
      Alert.alert(
        'Добро пожаловать!', 
        `Вы присоединились к "${response.organization.name}"`
      );
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Неверный код приглашения');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'type') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>Выберите тип регистрации</Text>
          </View>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setStep('company')}
          >
            <Text style={styles.optionEmoji}>🏢</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Создать компанию</Text>
              <Text style={styles.optionDescription}>
                Я управляющий и хочу создать новую компанию
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setStep('invite')}
          >
            <Text style={styles.optionEmoji}>📨</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>У меня есть код</Text>
              <Text style={styles.optionDescription}>
                Меня пригласили, и у меня есть код приглашения
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Назад к входу</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'company') {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>🏢 Создание компании</Text>
              <Text style={styles.subtitle}>Заполните данные для регистрации</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Название компании *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ООО Моя компания"
                  placeholderTextColor="#9CA3AF"
                  value={organizationName}
                  onChangeText={setOrganizationName}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ваше имя *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Иван Иванов"
                  placeholderTextColor="#9CA3AF"
                  value={managerName}
                  onChangeText={setManagerName}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="manager@company.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Пароль *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Минимум 6 символов"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Телефон (необязательно)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+7 999 123 45 67"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleCreateCompany}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Создать компанию</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setStep('type')}
              disabled={isSubmitting}
            >
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // step === 'invite'
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>📨 Регистрация по коду</Text>
            <Text style={styles.subtitle}>Введите код из приглашения в WhatsApp</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Код приглашения *</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor="#9CA3AF"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ваше имя *</Text>
              <TextInput
                style={styles.input}
                placeholder="Иван Иванов"
                placeholderTextColor="#9CA3AF"
                value={managerName}
                onChangeText={setManagerName}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="employee@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Пароль *</Text>
              <TextInput
                style={styles.input}
                placeholder="Минимум 6 символов"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Должность (необязательно)</Text>
              <TextInput
                style={styles.input}
                placeholder="Официант, Повар, и т.д."
                placeholderTextColor="#9CA3AF"
                value={position}
                onChangeText={setPosition}
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleRegisterByInvite}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Присоединиться</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep('type')}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  optionEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  submitButton: {
    backgroundColor: '#FF6600',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
