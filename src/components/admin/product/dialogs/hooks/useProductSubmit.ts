import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import {
  CATEGORIES,
  CATEGORIES_WITHOUT_VARIATIONS,
  PLACEHOLDER_IMAGE_URL,
  VINYL_CATEGORIES,
} from "../constants";
import type { ProductVariation, VinylTrack } from "../types";
import { uploadProductImage } from "../utils/uploads";

/**
 * Calcule le stock total et les listes uniques de tailles/couleurs
 * pour un ensemble de variations.
 */
const summarizeVariations = (variations: ProductVariation[]) => ({
  totalStock: variations.reduce((sum, v) => sum + v.stock, 0),
  uniqueColors: [...new Set(variations.map((v) => v.color))],
  uniqueSizes: [...new Set(variations.map((v) => v.size))],
});

/**
 * Construit la structure `size_stocks` à sauvegarder selon la nature
 * du produit : variations (t-shirts/sweats), pistes vinyles, ou vide.
 */
const buildSizeStocks = (params: {
  needsVariations: boolean;
  isVinyl: boolean;
  variations: ProductVariation[];
  vinylTracks: VinylTrack[];
  streamingUrl?: string | null;
}) => {
  const { needsVariations, isVinyl, variations, vinylTracks, streamingUrl } = params;

  if (needsVariations) {
    const sizeStocks: { [size: string]: number } = {};
    variations.forEach((v) => {
      sizeStocks[v.size] = (sizeStocks[v.size] || 0) + v.stock;
    });
    return JSON.parse(JSON.stringify({ variations, sizeStocks }));
  }
  if (isVinyl) {
    return JSON.parse(
      JSON.stringify({ vinylTracks, streamingUrl: streamingUrl ?? null }),
    );
  }
  return {};
};

interface AddParams {
  newProduct: Partial<Product>;
  variations: ProductVariation[];
  vinylTracks: VinylTrack[];
  imageFile: File | null;
  multipleImageFiles: File[];
}

/**
 * Insère un produit dans Supabase après avoir uploadé les images et
 * consolidé les variations / pistes.
 */
export const addProduct = async ({
  newProduct,
  variations,
  vinylTracks,
  imageFile,
  multipleImageFiles,
}: AddParams): Promise<boolean> => {
  const category = newProduct.category || CATEGORIES[0];
  const needsVariations = !CATEGORIES_WITHOUT_VARIATIONS.includes(category);
  const isVinyl = VINYL_CATEGORIES.includes(category);

  if (needsVariations && variations.length === 0) {
    toast({
      title: "Error",
      description: "Please add at least one variation (color/size/stock).",
      variant: "destructive",
    });
    return false;
  }

  const { totalStock, uniqueColors, uniqueSizes } = needsVariations
    ? summarizeVariations(variations)
    : { totalStock: Number(newProduct.stock) || 0, uniqueColors: [], uniqueSizes: [] };

  // Image principale : upload prioritaire, sinon URL du storage picker.
  let imageUrl = "";
  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile);
  } else if (
    typeof newProduct.image === "string" &&
    newProduct.image.startsWith("http")
  ) {
    imageUrl = newProduct.image;
  }

  // Images additionnelles.
  let additionalImages: string[] = [];
  if (multipleImageFiles.length > 0) {
    additionalImages = await Promise.all(multipleImageFiles.map(uploadProductImage));
  } else if (Array.isArray(newProduct.images) && newProduct.images.length > 0) {
    additionalImages = newProduct.images;
  }

  const sizeStocksToSave = buildSizeStocks({
    needsVariations,
    isVinyl,
    variations,
    vinylTracks,
    streamingUrl: (newProduct as any).streamingUrl,
  });

  const { error } = await supabase.from("products").insert([
    {
      name: newProduct.name || "",
      description: newProduct.description || "",
      price: Number(newProduct.price) || 0,
      sold_price:
        newProduct.sold_price && Number(newProduct.sold_price) > 0
          ? Number(newProduct.sold_price)
          : null,
      image: imageUrl || PLACEHOLDER_IMAGE_URL,
      images: additionalImages.length > 0 ? additionalImages : null,
      category,
      stock: totalStock,
      sizes: uniqueSizes,
      colors: uniqueColors,
      size_stocks: sizeStocksToSave,
      seller_id: (await supabase.auth.getUser()).data.user?.id,
      is_new: true,
    },
  ]);

  if (error) throw error;
  return true;
};

interface EditParams {
  currentProduct: Product;
  editVariations: ProductVariation[];
  editVinylTracks: VinylTrack[];
  editImageFile: File | null;
  editMultipleImageFiles: File[];
}

/**
 * Met à jour un produit existant dans Supabase.
 * Retourne `true` en cas de succès, `false` si la validation échoue.
 */
export const editProduct = async ({
  currentProduct,
  editVariations,
  editVinylTracks,
  editImageFile,
  editMultipleImageFiles,
}: EditParams): Promise<boolean> => {
  const needsVariations = !CATEGORIES_WITHOUT_VARIATIONS.includes(
    currentProduct.category,
  );
  const isVinyl = VINYL_CATEGORIES.includes(currentProduct.category);

  if (needsVariations && editVariations.length === 0) {
    toast({
      title: "Error",
      description: "Please add at least one variation (color/size/stock).",
      variant: "destructive",
    });
    return false;
  }

  const { totalStock, uniqueColors, uniqueSizes } = needsVariations
    ? summarizeVariations(editVariations)
    : {
        totalStock: Number(currentProduct.stock) || 0,
        uniqueColors: [] as string[],
        uniqueSizes: [] as string[],
      };

  const sizeStocksToSave = buildSizeStocks({
    needsVariations,
    isVinyl,
    variations: editVariations,
    vinylTracks: editVinylTracks,
    streamingUrl: (currentProduct.size_stocks as any)?.streamingUrl,
  });

  let imageUrl = currentProduct.image;
  if (editImageFile) {
    imageUrl = await uploadProductImage(editImageFile);
  }

  let additionalImages = currentProduct.images || [];
  if (editMultipleImageFiles.length > 0) {
    additionalImages = await Promise.all(
      editMultipleImageFiles.map(uploadProductImage),
    );
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: currentProduct.name,
      description: currentProduct.description,
      price: Number(currentProduct.price),
      sold_price:
        currentProduct.sold_price && Number(currentProduct.sold_price) > 0
          ? Number(currentProduct.sold_price)
          : null,
      image: imageUrl,
      images: additionalImages.length > 0 ? additionalImages : null,
      category: currentProduct.category,
      stock: totalStock,
      sizes: uniqueSizes,
      colors: uniqueColors,
      size_stocks: sizeStocksToSave,
    })
    .eq("id", currentProduct.id);

  if (error) {
    console.error("Update error:", error);
    toast({
      title: "Error",
      description: `Failed to update product. ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
  return true;
};