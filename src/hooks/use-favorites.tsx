
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { useFavoritesAuth } from '@/utils/favorites/auth';
import { fetchUserFavorites, saveFavoriteToDatabase, removeFavoriteFromDatabase } from '@/utils/favorites/database';
import { getFavoritesFromLocalStorage, saveFavoritesToLocalStorage } from '@/utils/favorites/localStorage';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isSupabaseConnected, authListener } = useFavoritesAuth();

  // Fetch favorites based on authentication status
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user || !isSupabaseConnected) {
        // Load from localStorage if user is not authenticated or Supabase is not connected
        const localFavorites = getFavoritesFromLocalStorage();
        setFavorites(localFavorites);
        setLoading(false);
      } else if (user) {
        // Load from Supabase if authenticated
        await loadUserFavoritesFromDatabase(user.id);
      }
    };

    loadFavorites();
  }, [user, isSupabaseConnected]);

  // Save anonymous user favorites to localStorage
  useEffect(() => {
    if (!user || !isSupabaseConnected) {
      saveFavoritesToLocalStorage(favorites);
    }
  }, [favorites, user, isSupabaseConnected]);

  // Cleanup auth listener on unmount
  useEffect(() => {
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [authListener]);

  const loadUserFavoritesFromDatabase = async (userId: string) => {
    setLoading(true);
    
    try {
      const products = await fetchUserFavorites(userId);
      setFavorites(products);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
      
      // Fallback to localStorage
      const localFavorites = getFavoritesFromLocalStorage();
      setFavorites(localFavorites);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  const addToFavorites = async (product: Product) => {
    setFavorites(prev => [...prev, product]);
    toast.success("Added to favorites!");
    
    // If user is authenticated and Supabase is connected, save to Supabase
    if (user && isSupabaseConnected) {
      try {
        await saveFavoriteToDatabase(user.id, product.id);
      } catch (error) {
        console.error('Error saving favorite to database:', error);
        toast.error('Failed to save favorite');
      }
    } else {
      // Save to localStorage if not authenticated or Supabase is not connected
      saveFavoritesToLocalStorage([...favorites, product]);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
    toast.success("Removed from favorites");
    
    // If user is authenticated and Supabase is connected, remove from Supabase
    if (user && isSupabaseConnected) {
      try {
        await removeFavoriteFromDatabase(user.id, productId);
      } catch (error) {
        console.error('Error removing favorite from database:', error);
        toast.error('Failed to remove favorite');
      }
    } else {
      // Save to localStorage if not authenticated or Supabase is not connected
      const updatedFavorites = favorites.filter(item => item.id !== productId);
      saveFavoritesToLocalStorage(updatedFavorites);
    }
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
      loading
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
