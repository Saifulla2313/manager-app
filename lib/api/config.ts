/**
 * API Configuration
 * 
 * Централизованная конфигурация для работы с бэкендом.
 * В продакшене BASE_URL должен браться из переменных окружения.
 */

import { Platform } from 'react-native';

// На Android эмуляторе localhost недоступен, используем 10.0.2.2
// На iOS симуляторе и реальных устройствах — localhost или IP машины
const getBaseUrl = () => {
  if (__DEV__) {
    // В разработке
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Android эмулятор
    }
    return 'http://localhost:3000'; // iOS / Web
  }
  // В продакшене — ваш реальный API URL
  return 'https://api.yourapp.com';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000, // 30 секунд
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    
    // Organizations
    CREATE_ORGANIZATION: '/api/organizations',
    MY_ORGANIZATION: '/api/organizations/me',
    INVITES: '/api/organizations/invites',
    INVITE: (id: string) => `/api/organizations/invites/${id}`,
    REGISTER_BY_INVITE: '/api/organizations/register-by-invite',
    
    // Employees
    EMPLOYEES: '/employees',
    EMPLOYEE: (id: string) => `/employees/${id}`,
    
    // Tasks
    TASKS: '/tasks',
    TASK: (id: string) => `/tasks/${id}`,
    TASK_COMMENTS: (id: string) => `/tasks/${id}/comments`,
    
    // Routines
    ROUTINES: '/routines',
    ROUTINE: (id: string) => `/routines/${id}`,
    ROUTINE_PROGRESS: (id: string, date: string) => `/routines/${id}/progress/${date}`,
    ROUTINE_TASK_COMPLETE: (id: string, date: string, taskId: string) => 
      `/routines/${id}/progress/${date}/tasks/${taskId}/complete`,
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: '/notifications/read-all',
    
    // Stats
    STATS_DASHBOARD: '/stats/dashboard',
    STATS_EMPLOYEE: '/stats/employee',
    
    // Health
    HEALTH: '/health',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

