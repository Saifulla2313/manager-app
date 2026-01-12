/**
 * API Module - Public Exports
 * 
 * Единая точка входа для всего API-слоя.
 */

// Client
export { apiClient } from './client';

// Config
export { API_CONFIG, STORAGE_KEYS } from './config';

// Types
export * from './types';

// Services
export { authService } from './services/auth';
export { organizationsService } from './services/organizations';
export { employeesService } from './services/employees';
export { tasksService } from './services/tasks';
export { routinesService } from './services/routines';
export { notificationsService } from './services/notifications';
export { statsService } from './services/stats';

