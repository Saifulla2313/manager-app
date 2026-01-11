/**
 * Employees Hooks
 * 
 * Хуки для работы с сотрудниками.
 */

import { useApi } from './useApi';
import { employeesService } from '../lib/api';

/**
 * Хук для получения списка сотрудников
 */
export function useEmployees() {
  const result = useApi(
    () => employeesService.getAll().then((res) => ({
      ...res,
      data: res.data ? res.data.employees : null,
    })),
    []
  );

  return {
    employees: result.data ?? [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Хук для получения профиля сотрудника
 */
export function useEmployee(employeeId: string | null) {
  const result = useApi(
    async () => {
      if (!employeeId) {
        return { data: null, error: null, status: 0 };
      }
      const res = await employeesService.getById(employeeId);
      return {
        ...res,
        data: res.data ? res.data.employee : null,
      };
    },
    [employeeId]
  );

  return {
    employee: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

