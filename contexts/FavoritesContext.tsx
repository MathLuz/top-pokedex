'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'pokemon-favorites';

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (pokemonId: number) => boolean;
  toggleFavorite: (pokemonId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function loadFavoritesFromStorage(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return [];
}

function saveFavoritesToStorage(favorites: number[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar favoritos apenas no cliente
  useEffect(() => {
    setFavorites(loadFavoritesFromStorage());
    setIsInitialized(true);
  }, []);

  // Salvar favoritos quando mudarem (apenas depois de inicializado)
  useEffect(() => {
    if (isInitialized) {
      saveFavoritesToStorage(favorites);
    }
  }, [favorites, isInitialized]);

  const toggleFavorite = useCallback((pokemonId: number) => {
    const numericId = Number(pokemonId);
    
    setFavorites(prev => {
      if (prev.includes(numericId)) {
        return prev.filter(id => id !== numericId);
      } else {
        return [...prev, numericId];
      }
    });
  }, []);

  const isFavorite = useCallback((pokemonId: number) => {
    return favorites.includes(Number(pokemonId));
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
