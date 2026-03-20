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
    sessionStorage.removeItem('citizen-token');
  }, []);

  const hydrateSession = useCallback(async () => {
    const token = localStorage.getItem('citizen-token') || sessionStorage.getItem('citizen-token');
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

  useEffect(() => {
    const root = document.documentElement;
    const prefs = user?.preferences || {};
    root.classList.toggle('a11y-large-text', Boolean(prefs.largeText));
    root.classList.toggle('a11y-high-contrast', Boolean(prefs.highContrast));
    root.classList.toggle('a11y-simple-language', Boolean(prefs.simpleLanguage));
  }, [user]);

  const rememberSession = (nextUser, token, remember = true) => {
    setUser(nextUser);
    localStorage.setItem('citizen-auth', JSON.stringify(nextUser));
    sessionStorage.removeItem('citizen-token');
    if (remember) {
      localStorage.setItem('citizen-token', token);
    } else {
      sessionStorage.setItem('citizen-token', token);
      localStorage.removeItem('citizen-token');
    }
  };

  const login = async (email, password, remember = true) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    rememberSession(data.user, data.token, remember);
  };

  const signup = async ({ name, email, password, role = 'citizen', plan = 'free', remember = true }) => {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, plan }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    rememberSession(data.user, data.token, remember);
  };

  const updateProfile = async (patch) => {
    const response = await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Unable to update profile');
    }
    setUser(data);
    localStorage.setItem('citizen-auth', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
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
