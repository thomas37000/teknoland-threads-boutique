
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product, CartItem } from '@/types';
import { useAuth } from './use-auth';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('teknoland-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('teknoland-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    size?: string, 
    color?: string
  ) => {
    setCartItems(prev => {
      // Check if product already exists in cart
      const existingItemIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += quantity;
        toast.success("Cart updated!");
        return updatedItems;
      } else {
        // Add new item
        toast.success("Added to cart!");
        return [...prev, {
          product,
          quantity,
          size,
          color
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
