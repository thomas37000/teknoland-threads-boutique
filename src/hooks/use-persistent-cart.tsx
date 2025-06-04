
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const usePersistentCart = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Save cart item to database
  const saveCartItemToDatabase = async (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    if (!user) return;

    try {
      // Check if item already exists
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size || '')
        .eq('color', color || '');

      if (fetchError) {
        console.error('Error checking existing cart item:', fetchError);
        return;
      }

      if (existingItems && existingItems.length > 0) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItems[0].quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems[0].id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
        }
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity,
            size: size || null,
            color: color || null
          });

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving cart item:', error);
    }
  };

  // Remove cart item from database
  const removeCartItemFromDatabase = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing cart item:', error);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  // Update cart item quantity in database
  const updateCartItemInDatabase = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error updating cart item quantity:', error);
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  // Clear all cart items from database
  const clearCartInDatabase = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Load cart from database
  const loadCartFromDatabase = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart:', error);
        return [];
      }

      return cartItems || [];
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
