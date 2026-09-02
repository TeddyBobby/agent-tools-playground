'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Theme = 'system' | 'light' | 'dark';

const THEME_KEY = 'theme';

const THEME_ORDER: Theme[] = ['system', 'light', 'dark'];

const THEME_LABELS: Record<Theme, string> = {
  system: '🖥️ 跟随系统',
  light: '☀️ 亮色',
  dark: '🌙 暗色',
};

function isDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

// Apply the resolved theme to <html>. Runs before first paint via the FOUC
// script in the layout, and is re-invoked on every user change / OS flip.
function syncClass() {
  document.documentElement.classList.toggle('dark', isDark(readTheme()));
}

// Minimal external store — localStorage is the source of truth for the mode.
// The listener set keeps the same tab and cross-tab (storage event) in sync.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function setTheme(next: Theme) {
  localStorage.setItem(THEME_KEY, next);
  syncClass();
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  // getServerSnapshot returns 'system' so hydration matches the server HTML;
  // React then re-reads the client snapshot (readTheme) without a mismatch
  // warning. This state only drives the button label — the `.dark` class on
  // <html> is managed by syncClass(), not by React.
  const theme = useSyncExternalStore(subscribe, readTheme, (): Theme => 'system');

  // Follow OS preference changes while in "system" mode (subscription only, no
  // setState — the DOM class is the only thing that needs to move).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readTheme() === 'system') syncClass();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`切换主题，当前：${THEME_LABELS[theme]}`}
      title={`主题：${THEME_LABELS[theme]}`}
      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {THEME_LABELS[theme]}
    </button>
  );
}
