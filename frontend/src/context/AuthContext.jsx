import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, getApiBase, getErrorMessageFromResponse } from '../lib/api';

const AuthContext = createContext();

/** End signed-in session after this long without user activity (client-side guard; JWT expiry still applies). */
const SESSION_IDLE_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(null);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('citizen-refresh-token') || sessionStorage.getItem('citizen-refresh-token');
    const access = localStorage.getItem('citizen-token') || sessionStorage.getItem('citizen-token');
    if (access) {
      try {
        await fetch(`${getApiBase()}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
            'x-auth-token': access,
          },
          body: JSON.stringify(refresh ? { refreshToken: refresh } : {}),
        });
      } catch {
        /* offline or server down */
      }
    }
    setUser(null);
    localStorage.removeItem('citizen-auth');
    localStorage.removeItem('citizen-token');
    localStorage.removeItem('citizen-refresh-token');
    sessionStorage.removeItem('citizen-token');
    sessionStorage.removeItem('citizen-refresh-token');
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
        const hadSession = Boolean(token);
        logout();
        if (hadSession && typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
          window.location.assign('/login?reason=session-expired');
        }
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

  useEffect(() => {
    if (!user) {
      lastActivityRef.current = null;
      return undefined;
    }
    lastActivityRef.current = Date.now();
    const bump = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const interval = window.setInterval(() => {
      const last = lastActivityRef.current;
      if (last == null) return;
      if (Date.now() - last > SESSION_IDLE_MS) {
        logout();
        window.location.assign('/login?reason=idle');
      }
    }, 30000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(interval);
    };
  }, [user, logout]);

  const rememberSession = (nextUser, accessToken, refreshToken, remember = true) => {
    setUser(nextUser);
    localStorage.setItem('citizen-auth', JSON.stringify(nextUser));
    sessionStorage.removeItem('citizen-token');
    sessionStorage.removeItem('citizen-refresh-token');
    localStorage.removeItem('citizen-refresh-token');
    if (remember) {
      localStorage.setItem('citizen-token', accessToken);
      if (refreshToken) localStorage.setItem('citizen-refresh-token', refreshToken);
      sessionStorage.removeItem('citizen-token');
    } else {
      sessionStorage.setItem('citizen-token', accessToken);
      if (refreshToken) sessionStorage.setItem('citizen-refresh-token', refreshToken);
      localStorage.removeItem('citizen-token');
      localStorage.removeItem('citizen-refresh-token');
    }
  };

  /**
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember
   * @param {'resident'|'staff'|'organization'|'administrator'} portalRole
   */
  const login = async (email, password, remember = true, portalRole) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portalRole }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Sign-in could not be completed.');
    }

    if (data.mfaRequired && data.mfaPendingToken) {
      return {
        mfaRequired: true,
        mfaPendingToken: data.mfaPendingToken,
        message: data.message,
      };
    }

    rememberSession(data.user, data.token, data.refreshToken, remember);
    lastActivityRef.current = Date.now();
    return { success: true };
  };

  const completeMfaLogin = async (mfaPendingToken, code, remember = true) => {
    const response = await apiFetch('/api/auth/login/mfa', {
      method: 'POST',
      body: JSON.stringify({ mfaPendingToken, code: String(code || '').trim() }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Verification could not be completed.');
    }
    rememberSession(data.user, data.token, data.refreshToken, remember);
    lastActivityRef.current = Date.now();
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

    rememberSession(data.user, data.token, data.refreshToken, remember);
    lastActivityRef.current = Date.now();
  };

  const resendEmailVerification = useCallback(async () => {
    const response = await apiFetch('/api/auth/verify-email/resend', { method: 'POST', body: '{}' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (await getErrorMessageFromResponse(response)));
    }
    return data;
  }, []);

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

  const requestPasswordReset = useCallback(async (email) => {
    const response = await apiFetch('/api/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email: String(email || '').trim() }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (await getErrorMessageFromResponse(response)));
    }
    return data;
  }, []);

  const validatePasswordResetToken = useCallback(async (token) => {
    const response = await apiFetch('/api/auth/password-reset/validate', {
      method: 'POST',
      body: JSON.stringify({ token: String(token || '').trim() }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return false;
    return Boolean(data.valid);
  }, []);

  const confirmPasswordReset = useCallback(async (token, password) => {
    const response = await apiFetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token: String(token || '').trim(), password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (await getErrorMessageFromResponse(response)));
    }
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        completeMfaLogin,
        signup,
        logout,
        updateProfile,
        requestPasswordReset,
        validatePasswordResetToken,
        confirmPasswordReset,
        resendEmailVerification,
      }}
    >
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
