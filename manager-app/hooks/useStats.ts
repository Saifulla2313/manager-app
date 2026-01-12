/**
 * Stats Hooks
 * 
 * Хуки для получения статистики.
 */

import { useApi } from './useApi';
import { statsService } from '../lib/api';

/**
 * Хук для получения статистики дашборда менеджера
 */
export function useDashboardStats() {
  const result = useApi(() => statsService.getDashboard(), []);

  return {
    stats: result.data?.stats ?? null,
    recentActivity: result.data?.recentActivity ?? [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Хук для получения статистики сотрудника
 */
export function useEmployeeStats() {
  const result = useApi(
    () => statsService.getEmployee().then((res) => ({
      ...res,
      data: res.data ? res.data.stats : null,
    })),
    []
  );

  return {
    stats: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

