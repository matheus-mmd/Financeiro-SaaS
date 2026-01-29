'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Inicializar tema do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignorar erros de localStorage
    }
  }, []);

  const setDarkMode = useCallback((enabled) => {
    setIsDark(enabled);
    try {
      if (enabled) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {
      // Ignorar erros de localStorage
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}