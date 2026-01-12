/**
 * Secure Storage Hook
 * 
 * Кросс-платформенный хук для безопасного хранения данных.
 * Использует expo-secure-store на нативных платформах и localStorage на вебе.
 * 
 * Основан на официальной рекомендации Expo для хранения JWT токенов.
 */

import { useEffect, useCallback, useReducer } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

/**
 * Асинхронно сохраняет/удаляет значение в хранилище
 */
export async function setStorageItemAsync(key: string, value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value === null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

/**
 * Асинхронно получает значение из хранилища
 */
export async function getStorageItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

/**
 * Хук для работы с персистентным хранилищем
 * 
 * @param key - Ключ для хранения
 * @returns [[isLoading, value], setValue] - Состояние загрузки, значение и сеттер
 * 
 * @example
 * const [[isLoading, token], setToken] = useStorageState('auth_token');
 * 
 * // Сохранить токен
 * setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * 
 * // Удалить токен
 * setToken(null);
 */
export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  // Загрузка значения при монтировании
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then((value) => {
        setState(value);
      });
    }
  }, [key]);

  // Мемоизированный сеттер
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}

/**
 * Хук для хранения JSON-объектов
 * 
 * @example
 * const [[isLoading, user], setUser] = useStorageObject<User>('user_data');
 */
export function useStorageObject<T>(key: string): [[boolean, T | null], (value: T | null) => void] {
  const [[isLoading, rawValue], setRawValue] = useStorageState(key);

  const value = rawValue ? (JSON.parse(rawValue) as T) : null;

  const setValue = useCallback(
    (newValue: T | null) => {
      setRawValue(newValue ? JSON.stringify(newValue) : null);
    },
    [setRawValue]
  );

  return [[isLoading, value], setValue];
}

