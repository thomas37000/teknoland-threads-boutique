
import { toast } from 'sonner';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch user favorites from Supabase
 */
export const fetchUserFavorites = async (userId: string): Promise<Product[]> => {
  // Using the correct type for Supabase table names
  const { data: favoritesData, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  if (favoritesData && favoritesData.length > 0) {
    // Get product details for each favorite
    const productIds = favoritesData.map((fav) => fav.product_id);
    
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);
      
    if (productsError) {
      throw productsError;
    }
    
    if (productsData) {
      return productsData as Product[];
    }
  }
  
  return [];
};

/**
 * Save a favorite to Supabase
 */
export const saveFavoriteToDatabase = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      product_id: productId
    });
    
  if (error) {
    throw error;
  }
};

/**
 * Remove a favorite from Supabase
 */
export const removeFavoriteFromDatabase = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
    
  if (error) {
    throw error;
  }
};
