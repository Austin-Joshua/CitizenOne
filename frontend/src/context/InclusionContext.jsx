import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const EASY_KEY = 'citizenone-easy-mode';
const LITE_KEY = 'citizenone-connectivity-lite';

function readBool(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

const InclusionContext = createContext(null);

export function InclusionProvider({ children }) {
  const [easyMode, setEasyModeState] = useState(() =>
    typeof window !== 'undefined' ? readBool(EASY_KEY) : false
  );
  const [liteMode, setLiteModeState] = useState(() =>
    typeof window !== 'undefined' ? readBool(LITE_KEY) : false
  );

  const setEasyMode = useCallback((on) => {
    const v = Boolean(on);
    setEasyModeState(v);
    try {
      localStorage.setItem(EASY_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setLiteMode = useCallback((on) => {
    const v = Boolean(on);
    setLiteModeState(v);
    try {
      localStorage.setItem(LITE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-easy-mode', easyMode);
  }, [easyMode]);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-connectivity-lite', liteMode);
  }, [liteMode]);

  const value = useMemo(
    () => ({
      easyMode,
      setEasyMode,
      liteMode,
      setLiteMode,
    }),
    [easyMode, setEasyMode, liteMode, setLiteMode]
  );

  return <InclusionContext.Provider value={value}>{children}</InclusionContext.Provider>;
}

export function useInclusion() {
  const ctx = useContext(InclusionContext);
  if (!ctx) throw new Error('useInclusion must be used within InclusionProvider');
  return ctx;
}
