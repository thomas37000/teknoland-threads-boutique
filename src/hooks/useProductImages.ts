import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/hooks/useImageManagement";

export const useProductImages = () => {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("products")
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

      if (error) throw error;

      const mapped: StorageImage[] =
        data
          ?.filter((f) => f.name !== ".emptyFolderPlaceholder")
          .map((file) => ({
            name: file.name,
            url: supabase.storage.from("products").getPublicUrl(file.name).data.publicUrl,
            size: file.metadata?.size || 0,
            created_at: file.created_at || "",
          })) || [];

      setImages(mapped);
    } catch (error) {
      console.error("Error loading product images:", error);
      toast.error("Erreur lors du chargement des images produits");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("products").upload(fileName, file);
      if (error) throw error;

      toast.success("Image produit uploadée avec succès");
      loadImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Échec de l'upload de l'image produit");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (name: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;
    try {
      const { error } = await supabase.storage.from("products").remove([name]);
      if (error) throw error;
      toast.success("Image produit supprimée");
      loadImages();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Échec de la suppression");
    }
  };

  return { images, loading, uploading, uploadImage, deleteImage, loadImages };
};
