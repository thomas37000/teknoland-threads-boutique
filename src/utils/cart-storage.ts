
import { CartItem } from '@/types/cart';

const CART_STORAGE_KEY = 'teknoland-cart';
const RESERVED_CART_STORAGE_KEY = 'teknoland-reserved-cart';

export const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error);
    return [];
  }
};

export const saveCartToStorage = (cartItems: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

export const clearCartStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

export const loadReservedCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(RESERVED_CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to parse reserved cart from localStorage:', error);
    return [];
  }
};

export const saveReservedCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(RESERVED_CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save reserved cart to localStorage:', error);
  }
};
