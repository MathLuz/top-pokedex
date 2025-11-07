'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Detectar tema salvo ou preferência do sistema
    const getInitialTheme = (): 'light' | 'dark' => {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          return savedTheme;
        }
        
        // Se não tem tema salvo, usar preferência do sistema
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
      
      return 'light';
    };

    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    setIsInitialized(true);

    // Aplicar tema ao documento
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      
      try {
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
      
      return newTheme;
    });
  };

  return { theme, toggleTheme, isInitialized };
}
