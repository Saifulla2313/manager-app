import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const isAuthenticated = !!userRole;

  const login = (role: UserRole) => {
    setUserRole(role);
  };

  const logout = () => {
    setUserRole(null);
    setSelectedEmployeeId(null);
    setSelectedTaskId(null);
    setSelectedTemplateId(null);
  };

  return (
    <AuthContext.Provider value={{
      userRole,
      isAuthenticated,
      login,
      logout,
      selectedEmployeeId,
      setSelectedEmployeeId,
      selectedTaskId,
      setSelectedTaskId,
      selectedTemplateId,
      setSelectedTemplateId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}