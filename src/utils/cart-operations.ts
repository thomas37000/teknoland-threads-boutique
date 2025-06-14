
import { CartItem } from "@/types/cart";
import { Product } from "@/types";

export const addItemToCart = (
  items: CartItem[],
  product: Product,
  quantity = 1,
  size?: string,
  color?: string
): CartItem[] => {
  const existingItemIndex = items.findIndex(item => 
    item.id === product.id && item.size === size && item.color === color
  );

  if (existingItemIndex > -1) {
    const updatedItems = [...items];
    updatedItems[existingItemIndex].quantity += quantity;
    return updatedItems;
  }

  const newItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity,
    size,
    color,
  };

  return [...items, newItem];
};

export const removeItemFromCart = (items: CartItem[], productId: string): CartItem[] => {
  return items.filter(item => item.id !== productId);
};

export const updateItemQuantity = (
  items: CartItem[],
  productId: string,
  quantity: number
): CartItem[] => {
  if (quantity <= 0) {
    return removeItemFromCart(items, productId);
  }

  return items.map(item =>
    item.id === productId ? { ...item, quantity } : item
  );
};

export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};
