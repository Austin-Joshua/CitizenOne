import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Menu, LogOut, Settings, IdCard, CreditCard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useI18n } from '../../context/I18nContext';
import { cn } from '../ui';
import { querySearchItems } from '../../lib/searchIndex';
import { AppLogo } from '../brand/AppLogo';
import LanguageToggle from '../inclusive/LanguageToggle';

const iconBtn =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-surface hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35';

const panelMotion = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -2 },
  transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
};

const TopBar = ({ onMobileMenuClick }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
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

  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const rawResults = useMemo(() => querySearchItems(search), [search]);
  const searchResults = useMemo(
    () =>
      rawResults.map((r) => ({
        ...r,
        title: t(`search.${r.id}.title`) || r.title,
        subtitle: t(`search.${r.id}.subtitle`) || r.subtitle,
        category: t(`search.${r.id}.category`) || r.category,
      })),
    [rawResults, t]
  );

  useEffect(() => {
    const onDoc = (e) => {
      const target = e.target;
      if (notifRef.current?.contains(target)) return;
      if (profileRef.current?.contains(target)) return;
      if (searchRef.current?.contains(target)) return;
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

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const initial = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border-light bg-base/90 backdrop-blur-md supports-[backdrop-filter]:bg-base/75">
      <div className="mx-auto flex h-16 min-h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-[72px] xl:px-20">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <button
          type="button"
          className={cn(iconBtn, 'lg:hidden')}
          aria-label={t('topbar.openMenu')}
          onClick={onMobileMenuClick}
        >
          <Menu size={20} strokeWidth={2} aria-hidden />
        </button>

        <Link
          to="/app/dashboard"
          className="hidden min-w-0 md:flex"
          aria-label={t('nav.dashboard')}
        >
          <AppLogo size="sm" title={t('brand.short')} subtitle={t('brand.tagline')} />
        </Link>
      </div>

      <div className="mx-auto min-w-0 max-w-2xl flex-1" ref={searchRef}>
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-tertiary">
            <Search size={17} strokeWidth={2} aria-hidden />
          </span>
          <input
            type="search"
            placeholder={t('topbar.search')}
            aria-label={t('topbar.searchAria')}
            className="h-10 w-full rounded-xl border border-border-light bg-surface py-2 pl-10 pr-3 text-sm text-primary placeholder:text-tertiary transition-[border-color,box-shadow] focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/15"
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
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border-light bg-base shadow-elevated-md"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-secondary">{t('topbar.noResults')}</div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <button
                          type="button"
                          className="w-full border-b border-border-light/60 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-surface"
                          onClick={() => {
                            navigate(result.path);
                            setSearch('');
                            setSearchOpen(false);
                          }}
                        >
                          <p className="text-[10px] font-medium uppercase tracking-wide text-tertiary">{result.category}</p>
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

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <LanguageToggle />

        <button
          type="button"
          className={iconBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Sun
              size={18}
              strokeWidth={2}
              className={cn(
                'absolute transition-opacity duration-150',
                theme === 'dark' ? 'opacity-0' : 'opacity-100'
              )}
              aria-hidden
            />
            <Moon
              size={18}
              strokeWidth={2}
              className={cn(
                'absolute transition-opacity duration-150',
                theme === 'dark' ? 'opacity-100' : 'opacity-0'
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
            aria-label={
              unreadCount
                ? t('topbar.notificationsUnread', { count: unreadCount > 9 ? '9+' : unreadCount })
                : t('topbar.notifications')
            }
            onClick={() => {
              setProfileOpen(false);
              setPanelOpen((o) => !o);
            }}
          >
            <Bell size={18} strokeWidth={2} aria-hidden />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-primary px-1 text-[9px] font-bold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {panelOpen && (
              <motion.div
                {...panelMotion}
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-1rem,320px)] overflow-hidden rounded-xl border border-border-light bg-base shadow-elevated-md"
                role="dialog"
                aria-label={t('topbar.notificationsDialog')}
              >
                <div className="flex items-center justify-between border-b border-border-light px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-primary">{t('topbar.notifications')}</p>
                    <p className="text-xs text-tertiary">
                      {timeLabel ? t('topbar.updated', { time: timeLabel }) : t('topbar.loading')}
                    </p>
                  </div>
                  {items.length > 0 && (
                    <button
                      type="button"
                      className="rounded px-1 text-xs font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
                      onClick={markAllRead}
                    >
                      {t('topbar.markAllRead')}
                    </button>
                  )}
                </div>
                <ul className="max-h-72 overflow-y-auto py-1">
                  {items.length === 0 ? (
                    <li className="px-3 py-8 text-center text-sm text-secondary">{t('topbar.noNotifications')}</li>
                  ) : (
                    items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full border-b border-border-light/60 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-surface',
                            n.clientUnread && 'bg-accent-primary/[0.04]'
                          )}
                          onClick={() => markAsRead(n.stableId)}
                        >
                          <p className="text-[10px] font-medium uppercase tracking-wide text-tertiary">{n.type}</p>
                          <p className="text-[15px] font-medium text-primary">{n.title}</p>
                          <p className="mt-0.5 text-sm leading-snug text-secondary">{n.body}</p>
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
              'ml-0.5 overflow-hidden rounded-full border border-border-light bg-surface hover:bg-surface'
            )}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label={t('topbar.accountMenu')}
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
                className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[208px] overflow-hidden rounded-xl border border-border-light bg-base py-1 shadow-elevated-md"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/profile');
                  }}
                >
                  <IdCard size={16} aria-hidden />
                  {t('topbar.profile')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/settings');
                  }}
                >
                  <Settings size={16} aria-hidden />
                  {t('nav.settings')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/app/subscription');
                  }}
                >
                  <CreditCard size={16} aria-hidden />
                  {t('topbar.subscription')}
                </button>
                <div className="my-1 h-px bg-border-light" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-semantic-error transition-colors hover:bg-semantic-error-muted focus:outline-none focus-visible:bg-semantic-error-muted"
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden />
                  {t('topbar.logOut')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </header>
  );
};

export default TopBar;
