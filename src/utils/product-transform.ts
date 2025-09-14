import { Product, ProductVariation } from "@/types";

export const transformProductFromDB = (dbProduct: any): Product => {
  const colors = dbProduct.colors || [];
  const images = dbProduct.images || [];
  
  // Create colorImages mapping
  let colorImages: {[color: string]: string} = {};
  
  // Prioritize variations if they exist and have images
  if (dbProduct.variations && dbProduct.variations.length > 0) {
    dbProduct.variations.forEach((variation: any) => {
      if (variation.color && variation.image) {
        colorImages[variation.color] = variation.image;
      }
    });
  }
  
  // Fallback to colors/images mapping if no variations or missing images
  if (colors.length > 0 && Object.keys(colorImages).length === 0) {
    // Create a complete mapping including main image
    const allImages = [dbProduct.image, ...images];
    colors.forEach((color: string, index: number) => {
      colorImages[color] = allImages[index] || dbProduct.image;
    });
  }

  // Calculate if product is new (created within last 2 months)
  const createdAt = new Date(dbProduct.created_at);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const isNew = createdAt > twoMonthsAgo;
  
  return {
    ...dbProduct,
    size_stocks: dbProduct.size_stocks ? (dbProduct.size_stocks as Record<string, number>) : {},
    variations: dbProduct.variations ? (dbProduct.variations as ProductVariation[]) : [],
    isNew: dbProduct.is_new ? isNew : false,
    colors,
    sizes: dbProduct.sizes || [],
    images,
    colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined
  };
};

export const transformProductsFromDB = (dbProducts: any[]): Product[] => {
  return dbProducts.map(transformProductFromDB);
};