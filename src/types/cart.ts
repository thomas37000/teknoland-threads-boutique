
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
  /** Marque l'article comme réservé (en attente de validation admin). */
  reserved?: boolean;
}

export interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  reservedItems: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  removeReservedItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  reserveCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  totalItems: number;
  subtotal: number;
}
