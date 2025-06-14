
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { CartItem } from '@/types/cart';
import { CartContext } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/use-auth';
import { 
  loadCartFromStorage, 
  saveCartToStorage 
} from '@/utils/cart-storage';
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  calculateCartTotals
} from '@/utils/cart-operations';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCartItems(savedCart);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    size?: string, 
    color?: string
  ) => {
    setCartItems(prev => {
      const updatedCart = addItemToCart(prev, product, quantity, size, color);
      const existingItemIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );
      
      if (existingItemIndex > -1) {
        toast.success("Cart updated!");
      } else {
        toast.success("Added to cart!");
      }
      
      return updatedCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => removeItemFromCart(prev, productId));
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => updateItemQuantity(prev, productId, quantity));
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const { totalItems, subtotal } = calculateCartTotals(cartItems);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
