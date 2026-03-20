import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, LogOut, Settings, IdCard, CreditCard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../ui';
import { querySearchItems } from '../../lib/searchIndex';

const iconBtn =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent text-secondary transition-colors hover:bg-surface hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/45 active:scale-[0.97]';

const panelMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.99 },
  transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
};

const TopBar = ({ onMobileMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const {
    items,
    unreadCount,
    panelOpen,
    setPanelOpen,
    lastUpdated,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchResults = useMemo(() => querySearchItems(search), [search]);

  useEffect(() => {
    const onDoc = (e) => {
      const t = e.target;
      if (notifRef.current?.contains(t)) return;
      if (profileRef.current?.contains(t)) return;
      if (searchRef.current?.contains(t)) return;
      setPanelOpen(false);
      setProfileOpen(false);
      setSearchOpen(false);
    };
    if (panelOpen || profileOpen || searchOpen) {
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }
    return undefined;
  }, [panelOpen, profileOpen, searchOpen, setPanelOpen]);

  const timeLabel =
    lastUpdated &&
    lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const initial = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex min-h-[56px] shrink-0 items-center gap-3 border-b border-border-light bg-base/85 px-3 py-2.5 backdrop-blur-md sm:min-h-[60px] sm:px-5 sm:py-3">
      <button
        type="button"
        className={cn(iconBtn, 'lg:hidden')}
        aria-label="Open menu"
        onClick={onMobileMenuClick}
      >
        <Menu size={20} strokeWidth={2} aria-hidden />
      </button>

      <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
        <div className="relative w-full max-w-lg" ref={searchRef}>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-tertiary">
            <Search size={18} strokeWidth={2} aria-hidden />
          </span>
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="h-10 w-full rounded-lg border border-border-light bg-transparent py-2 pl-10 pr-3 text-[15px] text-primary placeholder:text-tertiary shadow-none transition-[border-color,box-shadow] focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />
          <AnimatePresence>
            {searchOpen && search.trim() && (
              <motion.div
                {...panelMotion}
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border-light bg-surface shadow-lg"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-secondary">No results found.</div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <button
                          type="button"
                          className="w-full border-b border-border-light/70 px-4 py-3 text-left transition-colors last:border-0 hover:bg-base/75"
                          onClick={() => {
                            navigate(result.path);
                            setSearch('');
                            setSearchOpen(false);
                          }}
                        >
                          <p className="text-[11px] font-medium uppercase tracking-wide text-tertiary">{result.category}</p>
                          <p className="text-[15px] font-medium text-primary">{result.title}</p>
                          <p className="text-sm text-secondary">{result.subtitle}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          className={iconBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Sun
              size={19}
              strokeWidth={2}
              className={cn(
                'absolute transition-all duration-200 ease-out',
                theme === 'dark' ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
              )}
              aria-hidden
            />
            <Moon
              size={19}
              strokeWidth={2}
              className={cn(
                'absolute transition-all duration-200 ease-out',
                theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'
              )}
              aria-hidden
            />
          </span>
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className={cn(iconBtn, 'relative')}
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            onClick={() => {
              setProfileOpen(false);
              setPanelOpen((o) => !o);
            }}
          >
            <Bell size={19} strokeWidth={2} aria-hidden />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-primary px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {panelOpen && (
              <motion.div
                {...panelMotion}
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-1rem,340px)] overflow-hidden rounded-xl border border-border-light bg-surface shadow-lg"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="flex items-center justify-between border-b border-border-light px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-primary">Notifications</p>
                    <p className="text-xs text-tertiary">
                      {timeLabel ? `Updated ${timeLabel}` : 'Loading…'}
                    </p>
                  </div>
                  {items.length > 0 && (
                    <button
                      type="button"
                      className="rounded px-1 text-xs font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ul className="max-h-80 overflow-y-auto py-1">
                  {items.length === 0 ? (
                    <li className="px-3 py-8 text-center text-sm text-secondary">No notifications</li>
                  ) : (
                    items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full border-b border-border-light/70 px-3 py-3 text-left transition-colors last:border-0 hover:bg-base/80',
                            n.clientUnread && 'bg-accent-primary/[0.05]'
                          )}
                          onClick={() => markAsRead(n.stableId)}
                        >
                          <p className="text-[11px] font-medium uppercase tracking-wide text-tertiary">
                            {n.type}
                          </p>
                          <p className="text-[15px] font-medium text-primary">{n.title}</p>
                          <p className="mt-1 text-sm leading-snug text-secondary">{n.body}</p>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            className={cn(
              iconBtn,
              'overflow-hidden rounded-full border-border-light bg-surface/60 hover:bg-surface'
            )}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
            onClick={() => {
              setPanelOpen(false);
              setProfileOpen((o) => !o);
            }}
          >
            <span className="text-sm font-semibold text-accent-primary">{initial}</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                {...panelMotion}
                className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-xl border border-border-light bg-surface py-1 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[15px] text-primary transition-colors hover:bg-base focus:outline-none focus-visible:bg-base"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/profile');
                  }}
                >
                  <IdCard size={17} aria-hidden />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[15px] text-primary transition-colors hover:bg-base focus:outline-none focus-visible:bg-base"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/settings');
                  }}
                >
                  <Settings size={17} aria-hidden />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[15px] text-primary transition-colors hover:bg-base focus:outline-none focus-visible:bg-base"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/subscription');
                  }}
                >
                  <CreditCard size={17} aria-hidden />
                  Subscription
                </button>
                <div className="my-1 h-px bg-border-light" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[15px] text-red-600 transition-colors hover:bg-red-500/10 focus:outline-none focus-visible:bg-red-500/10 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut size={17} aria-hidden />
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
