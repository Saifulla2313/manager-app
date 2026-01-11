/**
 * API Hooks
 * 
 * Хуки для удобной работы с API в компонентах.
 * Обеспечивают загрузку данных, кэширование и обработку ошибок.
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

interface ApiResponse<T> {
  data: T | null;
  error: { error: string } | null;
  status: number;
}

// ─────────────────────────────────────────────────────────────
// useApi - базовый хук для загрузки данных
// ─────────────────────────────────────────────────────────────

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetcher();

      if (response.error) {
        setState({
          data: null,
          isLoading: false,
          error: response.error.error,
        });
      } else {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Ошибка загрузки',
      });
    }
  }, [fetcher]);

  useEffect(() => {
    fetch();
  }, deps);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    refetch: fetch,
    setData,
  };
}

// ─────────────────────────────────────────────────────────────
// useMutation - хук для мутаций (POST, PATCH, DELETE)
// ─────────────────────────────────────────────────────────────

interface UseMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<{ success: boolean; data?: TOutput; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<ApiResponse<TOutput>>
): UseMutationResult<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await mutator(input);

        if (response.error) {
          setError(response.error.error);
          return { success: false, error: response.error.error };
        }

        return { success: true, data: response.data ?? undefined };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, isLoading, error };
}

// ─────────────────────────────────────────────────────────────
// useRefreshOnFocus - обновление данных при фокусе экрана
// ─────────────────────────────────────────────────────────────

import { useFocusEffect } from 'expo-router';

export function useRefreshOnFocus(refetch: () => void) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
}

