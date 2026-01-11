import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  // Показываем загрузку пока определяется состояние
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  // Редирект в зависимости от состояния авторизации
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Редирект по роли
  if (userRole === 'MANAGER') {
    return <Redirect href="/(user)/(manager)/dashboard" />;
  }

  return <Redirect href="/(user)/(employee)/main" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

