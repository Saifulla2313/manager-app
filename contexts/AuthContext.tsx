import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStorageState } from '../lib/storage';
import { authService, STORAGE_KEYS } from '../lib/api';
import type { User, UserRole } from '../lib/api/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AuthContextType {
  // Auth state
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Selection state (для навигации)
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Персистентное хранение токена
  const [[isTokenLoading, token], setToken] = useStorageState(STORAGE_KEYS.AUTH_TOKEN);
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Derived state
  const isAuthenticated = !!user && !!token;
  const userRole = user?.role ?? null;
  const isLoading = isTokenLoading || isUserLoading;

  // ─────────────────────────────────────────────────────────────
  // Load user on token change
  // ─────────────────────────────────────────────────────────────
  
  useEffect(() => {
    async function loadUser() {
      if (isTokenLoading) return;
      
      if (!token) {
        setUser(null);
        setIsUserLoading(false);
        return;
      }

      try {
        const response = await authService.me();
        
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          // Токен невалидный — очищаем
          console.log('Token invalid, clearing...');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setToken(null);
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    }

    loadUser();
  }, [token, isTokenLoading, setToken]);

  // ─────────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────────
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      if (response.error) {
        return { 
          success: false, 
          error: response.error.error || 'Ошибка входа' 
        };
      }

      if (response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, error: 'Неизвестная ошибка' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Ошибка сети. Проверьте подключение.' 
      };
    }
  }, [setToken]);

  // ─────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────
  
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSelectedEmployeeId(null);
    setSelectedTaskId(null);
    setSelectedTemplateId(null);
  }, [setToken]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedTaskId,
        setSelectedTaskId,
        selectedTemplateId,
        setSelectedTemplateId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
