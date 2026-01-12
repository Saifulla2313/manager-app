/**
 * Tasks Hooks
 * 
 * Хуки для работы с задачами.
 */

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { tasksService } from '../lib/api';
import type { InstantTask, CreateTaskInput, UpdateTaskInput } from '../lib/api/types';

/**
 * Хук для получения списка задач
 */
export function useTasks() {
  const result = useApi(
    () => tasksService.getAll().then((res) => ({
      ...res,
      data: res.data ? res.data.tasks : null,
    })),
    []
  );

  return {
    tasks: result.data ?? [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Хук для получения деталей задачи
 */
export function useTask(taskId: string | null) {
  const result = useApi(
    async () => {
      if (!taskId) {
        return { data: null, error: null, status: 0 };
      }
      const res = await tasksService.getById(taskId);
      return {
        ...res,
        data: res.data ? res.data.task : null,
      };
    },
    [taskId]
  );

  return {
    task: result.data,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Хук для создания задачи
 */
export function useCreateTask() {
  return useMutation((input: CreateTaskInput) =>
    tasksService.create(input).then((res) => ({
      ...res,
      data: res.data ? res.data.task : null,
    }))
  );
}

/**
 * Хук для обновления задачи
 */
export function useUpdateTask(taskId: string) {
  return useMutation((input: UpdateTaskInput) =>
    tasksService.update(taskId, input).then((res) => ({
      ...res,
      data: res.data ? res.data.task : null,
    }))
  );
}

/**
 * Хук для добавления комментария
 */
export function useAddComment(taskId: string) {
  return useMutation((message: string) =>
    tasksService.addComment(taskId, message).then((res) => ({
      ...res,
      data: res.data ? res.data.comment : null,
    }))
  );
}

