import { Product, ProductVariation } from "@/types";

export const transformProductFromDB = (dbProduct: any): Product => {
  return {
    ...dbProduct,
    size_stocks: dbProduct.size_stocks ? (dbProduct.size_stocks as Record<string, number>) : {},
    variations: dbProduct.variations ? (dbProduct.variations as ProductVariation[]) : [],
    isNew: dbProduct.is_new || false,
    colors: dbProduct.colors || [],
    sizes: dbProduct.sizes || [],
    images: dbProduct.images || []
  };
};

export const transformProductsFromDB = (dbProducts: any[]): Product[] => {
  return dbProducts.map(transformProductFromDB);
};