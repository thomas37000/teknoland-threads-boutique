
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const usePersistentCart = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Save cart item to database using raw SQL
  const saveCartItemToDatabase = async (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    if (!user) return;

    try {
      // Check if item already exists using raw SQL
      const { data: existingItems, error: fetchError } = await supabase
        .rpc('check_cart_item_exists', {
          p_user_id: user.id,
          p_product_id: productId,
          p_size: size || '',
          p_color: color || ''
        });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing cart item:', fetchError);
        return;
      }

      if (existingItems && existingItems.length > 0) {
        // Update existing item using raw SQL
        const { error: updateError } = await supabase
          .rpc('update_cart_item_quantity', {
            p_user_id: user.id,
            p_product_id: productId,
            p_quantity: existingItems[0].quantity + quantity
          });

        if (updateError) {
          console.error('Error updating cart item:', updateError);
        }
      } else {
        // Insert new item using raw SQL
        const { error: insertError } = await supabase
          .rpc('insert_cart_item', {
            p_user_id: user.id,
            p_product_id: productId,
            p_quantity: quantity,
            p_size: size || null,
            p_color: color || null
          });

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving cart item:', error);
    }
  };

  // Remove cart item from database using raw SQL
  const removeCartItemFromDatabase = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('delete_cart_item', {
          p_user_id: user.id,
          p_product_id: productId
        });

      if (error) {
        console.error('Error removing cart item:', error);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  // Update cart item quantity in database using raw SQL
  const updateCartItemInDatabase = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('update_cart_item_quantity', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: quantity
        });

      if (error) {
        console.error('Error updating cart item quantity:', error);
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  // Clear all cart items from database using raw SQL
  const clearCartInDatabase = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('clear_user_cart', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Error clearing cart:', error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Load cart from database - placeholder for now
  const loadCartFromDatabase = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      // For now return empty array - we'll implement this when we have the proper functions
      return [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadCartFromDatabase,
    saveCartItemToDatabase,
    removeCartItemFromDatabase,
    updateCartItemInDatabase,
    clearCartInDatabase,
    isLoading
  };
};
