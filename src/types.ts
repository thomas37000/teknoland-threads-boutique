
export interface ProductVariation {
  color: string;
  size: string;
  stock: number;
  image?: string; // URL de l'image pour cette variation
}

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
  variations?: ProductVariation[];
  seller_id?: string;
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
  roles: "client" | "admin" | "seller";
  cookieConsent?: boolean;
  cookieConsentDate?: string;
}

export interface Idea {
  id: number;
  desc: string | null;
  priority: string;
  created_at: string;
  cat_ideas?: string;
}

export interface DepenseMois {
  id: string;
  total: number;
  semaine_moyenne: number;
  annee: string;
  mois: string;
  created_at: string;
}
