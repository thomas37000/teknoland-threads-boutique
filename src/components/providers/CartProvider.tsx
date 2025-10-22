
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
      // Find the correct image based on color variation
      let productImage = product.image;
      
      // Check if product has variations with images
      if (color && product.variations && Array.isArray(product.variations)) {
        const variation = product.variations.find(
          (v: any) => v.color === color && v.image
        );
        if (variation?.image) {
          productImage = variation.image;
        }
      }
      
      // Check colorImages mapping as fallback
      if (color && product.colorImages && product.colorImages[color]) {
        productImage = product.colorImages[color];
      }
      
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImage,
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
