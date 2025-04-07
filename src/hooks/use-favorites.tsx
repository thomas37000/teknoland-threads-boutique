
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      
      // Clear favorites when user logs out
      if (event === 'SIGNED_OUT') {
        setFavorites([]);
      }
      
      // Reload favorites when user logs in
      if (event === 'SIGNED_IN' && session?.user) {
        fetchFavorites(session.user.id);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch favorites from local storage on initial load
  useEffect(() => {
    if (!user) {
      const savedFavorites = localStorage.getItem('teknoland-favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Failed to parse favorites from localStorage:', error);
        }
      }
      setLoading(false);
    } else {
      // If user is authenticated, fetch favorites from Supabase
      fetchFavorites(user.id);
    }
  }, [user]);

  // Save anonymous user favorites to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('teknoland-favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Fetch favorites from Supabase
  const fetchFavorites = async (userId: string) => {
    setLoading(true);
    try {
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select('*, product_id')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (favoritesData.length > 0) {
        // Get product details for each favorite
        const productIds = favoritesData.map(fav => fav.product_id);
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
          
        if (productsError) {
          throw productsError;
        }
        
        setFavorites(productsData);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
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
    
    // If user is authenticated, save to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: product.id
          });
          
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error saving favorite to database:', error);
        toast.error('Failed to save favorite');
      }
    }
  };

  const removeFromFavorites = async (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
    toast.success("Removed from favorites");
    
    // If user is authenticated, remove from Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
          
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error removing favorite from database:', error);
        toast.error('Failed to remove favorite');
      }
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
