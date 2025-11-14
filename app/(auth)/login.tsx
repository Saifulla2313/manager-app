import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function LoginScreen() {
  const [phone, setPhone] = useState('123');
  const [password, setPassword] = useState('133');
  const { login } = useAuth();

  const handleSubmit = () => {
    // Mock login - if phone starts with '1', login as manager, else employee
    const role: UserRole = phone.startsWith('1') ? 'manager' : 'employee';
    login(role);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Вход</Text>
            <Text style={styles.subtitle}>Добро пожаловать! Введите свои данные.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Номер телефона</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (999) 123-4567"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                required
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="Введите пароль"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                required
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleSubmit}
            >
              <Text style={styles.loginButtonText}>Войти</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Нет аккаунта? <Text style={styles.registerLink}>Создать аккаунт</Text>
            </Text>
          </View>

          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Демо доступы:</Text>
            <Text style={styles.demoText}>Менеджер: Телефон начинающийся с "1"</Text>
            <Text style={styles.demoText}>Сотрудник: Любой другой телефон</Text>
            <Text style={styles.demoNote}>(Пароль может быть любым)</Text>
          </View>
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
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FF6600',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#FF6600',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  registerLink: {
    color: '#FF6600',
  },
  demoContainer: {
    backgroundColor: '#FEF6E6',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  demoNote: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 8,
    fontStyle: 'italic',
  },
});