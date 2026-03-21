import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

function armThemeTransition(transitionRef) {
  if (transitionRef.current) window.clearTimeout(transitionRef.current);
  document.documentElement.classList.add('theme-switching');
  transitionRef.current = window.setTimeout(() => {
    document.documentElement.classList.remove('theme-switching');
    transitionRef.current = null;
  }, 200);
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('citizen-one-v2-theme');
    return stored === 'light' || stored === 'dark' ? stored : 'light';
  });
  const transitionRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('citizen-one-v2-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    armThemeTransition(transitionRef);
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    setTheme((t) => {
      if (t === mode) return t;
      armThemeTransition(transitionRef);
      return mode;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
