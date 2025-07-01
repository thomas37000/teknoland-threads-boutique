export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  isNew?: boolean;
  sizes?: string[];
  colors?: string[];
  colorImages?: {[color: string]: string};
  size_stocks?: {[size: string]: number} | null;
}

// CartItem is now in src/types/cart.ts
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  accountStatus: "active" | "inactive";
  roles: "client" | "admin";
  cookieConsent?: boolean;
  cookieConsentDate?: string;
}

export interface Idea {
  id: number;
  desc: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}
