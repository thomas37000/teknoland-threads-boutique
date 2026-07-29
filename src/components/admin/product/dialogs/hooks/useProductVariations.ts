import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "../constants";
import type { ProductVariation } from "../types";

/**
 * Gère les variations (couleur/taille/stock/image) pour l'ajout et l'édition.
 * - Reconstruit les variations depuis `size_stocks` d'un produit existant.
 * - Réinitialise l'état d'ajout à la fermeture du dialogue.
 */
export const useProductVariations = (
  currentProduct: Product | null,
  isAddDialogOpen: boolean,
) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [editVariations, setEditVariations] = useState<ProductVariation[]>([]);

  useEffect(() => {
    if (!currentProduct) {
      setEditVariations([]);
      return;
    }

    const sizeStocksData = currentProduct.size_stocks as any;
    if (!sizeStocksData) {
      setEditVariations([]);
      return;
    }

    if (sizeStocksData.variations && Array.isArray(sizeStocksData.variations)) {
      setEditVariations(sizeStocksData.variations);
      return;
    }

    // Format historique : reconstruit depuis sizes + colors + stocks par taille.
    if (currentProduct.sizes && currentProduct.colors) {
      const rebuilt: ProductVariation[] = [];
      currentProduct.colors.forEach((color) => {
        currentProduct.sizes!.forEach((size) => {
          rebuilt.push({ color, size, stock: sizeStocksData[size] || 0 });
        });
      });
      setEditVariations(rebuilt);
    }
  }, [currentProduct]);

  useEffect(() => {
    if (!isAddDialogOpen) setVariations([]);
  }, [isAddDialogOpen]);

  const addVariation = (isEdit = false) => {
    const newVariation: ProductVariation = {
      color: COLOR_OPTIONS[0],
      size: SIZE_OPTIONS[0],
      stock: 0,
      image: "",
    };
    if (isEdit) setEditVariations((prev) => [...prev, newVariation]);
    else setVariations((prev) => [...prev, newVariation]);
  };

  const removeVariation = (index: number, isEdit = false) => {
    if (isEdit) setEditVariations((prev) => prev.filter((_, i) => i !== index));
    else setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariation = (
    index: number,
    field: keyof ProductVariation,
    value: string | number,
    isEdit = false,
  ) => {
    const updater = (prev: ProductVariation[]) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "stock" ? parseInt(value as string) || 0 : value,
      };
      return next;
    };
    if (isEdit) setEditVariations(updater);
    else setVariations(updater);
  };

  return {
    variations,
    editVariations,
    addVariation,
    removeVariation,
    updateVariation,
  };
};