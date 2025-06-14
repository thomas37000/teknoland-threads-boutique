
import { Product } from '@/types';
import { CartItem } from '@/types/cart';

export const findExistingCartItem = (
  cartItems: CartItem[],
  productId: string,
  size?: string,
  color?: string
): number => {
  return cartItems.findIndex(item => 
    item.product.id === productId && 
    item.size === size && 
    item.color === color
  );
};

export const addItemToCart = (
  cartItems: CartItem[],
  product: Product,
  quantity: number = 1,
  size?: string,
  color?: string
): CartItem[] => {
  const existingItemIndex = findExistingCartItem(cartItems, product.id, size, color);

  if (existingItemIndex > -1) {
    const updatedItems = [...cartItems];
    updatedItems[existingItemIndex].quantity += quantity;
    return updatedItems;
  } else {
    return [...cartItems, {
      product,
      quantity,
      size,
      color
    }];
  }
};

export const removeItemFromCart = (
  cartItems: CartItem[],
  productId: string
): CartItem[] => {
  return cartItems.filter(item => item.product.id !== productId);
};

export const updateItemQuantity = (
  cartItems: CartItem[],
  productId: string,
  quantity: number
): CartItem[] => {
  return cartItems.map(item => 
    item.product.id === productId 
      ? { ...item, quantity: Math.max(1, quantity) } 
      : item
  );
};

export const calculateCartTotals = (cartItems: CartItem[]) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  return { totalItems, subtotal };
};
