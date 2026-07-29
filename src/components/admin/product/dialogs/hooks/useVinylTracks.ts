import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import { VINYL_CATEGORIES } from "../constants";
import type { VinylTrack } from "../types";
import { buildDefaultVinylTracks } from "../utils/vinylTracks";
import { uploadVinylAudio } from "../utils/uploads";

/**
 * Gère les pistes vinyle (add + edit) : initialisation par défaut selon la
 * catégorie sélectionnée, hydratation depuis un produit existant, et upload
 * audio par piste.
 */
export const useVinylTracks = (
  currentProduct: Product | null,
  addCategory: string | undefined,
) => {
  const [vinylTracks, setVinylTracks] = useState<VinylTrack[]>([]);
  const [editVinylTracks, setEditVinylTracks] = useState<VinylTrack[]>([]);

  // Ajout : reconstruit une piste par défaut à chaque changement de catégorie.
  useEffect(() => {
    setVinylTracks(buildDefaultVinylTracks(addCategory));
  }, [addCategory]);

  // Édition : hydrate depuis size_stocks.vinylTracks, ou tracks par défaut
  // si le produit est un vinyle mais n'a pas encore de pistes.
  useEffect(() => {
    if (!currentProduct) {
      setEditVinylTracks([]);
      return;
    }
    const sizeStocksData = currentProduct.size_stocks as any;
    if (sizeStocksData?.vinylTracks && Array.isArray(sizeStocksData.vinylTracks)) {
      setEditVinylTracks(sizeStocksData.vinylTracks);
      return;
    }
    if (VINYL_CATEGORIES.includes(currentProduct.category)) {
      setEditVinylTracks(buildDefaultVinylTracks(currentProduct.category));
    } else {
      setEditVinylTracks([]);
    }
  }, [currentProduct]);

  const updateVinylTrack = (
    index: number,
    field: keyof VinylTrack,
    value: string,
    isEdit = false,
  ) => {
    const updater = (prev: VinylTrack[]) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    };
    if (isEdit) setEditVinylTracks(updater);
    else setVinylTracks(updater);
  };

  const handleVinylAudioUpload = async (
    index: number,
    file: File,
    isEdit = false,
  ) => {
    try {
      const publicUrl = await uploadVinylAudio(file);
      if (!publicUrl) return;
      updateVinylTrack(index, "audioUrl", publicUrl, isEdit);
      toast({ title: "Audio uploadé", description: file.name });
    } catch (err: any) {
      console.error("Audio upload error:", err);
      toast({
        title: "Erreur d'upload",
        description: err.message || "Impossible d'uploader le fichier audio.",
        variant: "destructive",
      });
    }
  };

  return {
    vinylTracks,
    editVinylTracks,
    setVinylTracks,
    updateVinylTrack,
    handleVinylAudioUpload,
  };
};