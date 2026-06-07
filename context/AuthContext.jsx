'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Tracks whether we've finished reading localStorage so guards don't flash.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tms_user');
    if (stored) setUser(JSON.parse(stored));
    setInitializing(false);
  }, []);

  const persist = (user, token) => {
    localStorage.setItem('tms_token', token);
    localStorage.setItem('tms_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.user, data.token);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data.user, data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
