import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../lib/api';

const NotificationContext = createContext();

const POLL_MS = 12000;
const READ_STORAGE_KEY = 'citizen-notif-read';

function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(set) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [rawItems, setRawItems] = useState([]);
  const [readStableIds, setReadStableIds] = useState(loadReadIds);
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(false);

  const items = useMemo(
    () =>
      rawItems.map((n) => ({
        ...n,
        clientUnread: Boolean(n.unread) && !readStableIds.has(n.stableId),
      })),
    [rawItems, readStableIds]
  );

  const unreadCount = useMemo(() => items.filter((n) => n.clientUnread).length, [items]);

  const markAsRead = useCallback((stableId) => {
    setReadStableIds((prev) => {
      if (prev.has(stableId)) return prev;
      const next = new Set(prev);
      next.add(stableId);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadStableIds((prev) => {
      const next = new Set(prev);
      rawItems.forEach((n) => {
        if (n.stableId) next.add(n.stableId);
      });
      saveReadIds(next);
      return next;
    });
  }, [rawItems]);

  const fetchNotifications = useCallback(async () => {
    if (!user || !localStorage.getItem('citizen-token')) return;
    try {
      const res = await apiFetch('/api/notifications');
      if (!res.ok) {
        setConnected(false);
        return;
      }
      const data = await res.json();
      setRawItems(Array.isArray(data.items) ? data.items : []);
      setLastUpdated(new Date());
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const run = () => {
      void fetchNotifications();
    };
    const boot = window.setTimeout(run, 0);
    const id = window.setInterval(run, POLL_MS);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(id);
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        items,
        unreadCount,
        panelOpen,
        setPanelOpen,
        lastUpdated,
        connected,
        refresh: fetchNotifications,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
