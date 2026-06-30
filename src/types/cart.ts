
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  /** 'vinyle' pour les articles distribués depuis Airtable, sinon produit standard. */
  itemType?: "vinyle" | "product";
  /** Référence externe (ex: recordId Airtable pour les vinyles). */
  externalRef?: string;
}

export interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  totalItems: number;
  subtotal: number;
}
