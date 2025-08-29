import { Product, ProductVariation } from "@/types";

export const transformProductFromDB = (dbProduct: any): Product => {
  const colors = dbProduct.colors || [];
  const images = dbProduct.images || [];
  
  // Create colorImages mapping if we have both colors and images
  let colorImages: {[color: string]: string} = {};
  if (colors.length > 0 && images.length > 0) {
    colors.forEach((color: string, index: number) => {
      // Map each color to corresponding image, or use main image as fallback
      colorImages[color] = images[index] || dbProduct.image;
    });
  }

  return {
    ...dbProduct,
    size_stocks: dbProduct.size_stocks ? (dbProduct.size_stocks as Record<string, number>) : {},
    variations: dbProduct.variations ? (dbProduct.variations as ProductVariation[]) : [],
    isNew: dbProduct.is_new || false,
    colors,
    sizes: dbProduct.sizes || [],
    images,
    colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined
  };
};

export const transformProductsFromDB = (dbProducts: any[]): Product[] => {
  return dbProducts.map(transformProductFromDB);
};