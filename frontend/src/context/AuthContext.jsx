import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('citizen-auth');
    localStorage.removeItem('citizen-token');
  }, []);

  const hydrateSession = useCallback(async () => {
    const token = localStorage.getItem('citizen-token');
    if (!token) {
      localStorage.removeItem('citizen-auth');
      setUser(null);
      return;
    }
    try {
      const res = await apiFetch('/api/auth/me');
      if (!res.ok) {
        logout();
        return;
      }
      const profile = await res.json();
      setUser(profile);
      localStorage.setItem('citizen-auth', JSON.stringify(profile));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await hydrateSession();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateSession]);

  const login = async (email, password) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const nextUser = data.user;
    setUser(nextUser);
    localStorage.setItem('citizen-auth', JSON.stringify(nextUser));
    localStorage.setItem('citizen-token', data.token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
