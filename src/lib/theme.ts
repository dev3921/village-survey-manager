import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'vsm_theme';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event('vsm_theme_change'));
}

export function useTheme(): [Theme, (theme: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Initial sync
    const current = getInitialTheme();
    applyTheme(current);
    setThemeState(current);

    const handler = () => {
      setThemeState(getInitialTheme());
    };

    window.addEventListener('vsm_theme_change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('vsm_theme_change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return [theme, setTheme, toggleTheme];
}
