
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Load favorites from localStorage on initial load
  useEffect(() => {
    const savedFavorites = localStorage.getItem('teknoland-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage on changes
  useEffect(() => {
    localStorage.setItem('teknoland-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  const addToFavorites = (product: Product) => {
    setFavorites(prev => [...prev, product]);
    toast.success("Added to favorites!");
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
    toast.success("Removed from favorites");
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
