
import React, { useState, useEffect } from "react";
import { CartContext } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart";
import { loadCartFromStorage, saveCartToStorage } from "@/utils/cart-storage";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setItems(savedCart);
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = (product: any, quantity = 1, size?: string, color?: string) => {
    const existingItem = items.find(item => 
      item.id === product.id && 
      item.size === size && 
      item.color === color
    );

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size,
        color,
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    cartItems: items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
    totalItems: getItemCount(),
    subtotal: getTotalPrice(),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
