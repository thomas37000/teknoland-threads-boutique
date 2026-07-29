import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ALLOWED_AUDIO_EXTENSIONS,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
} from "../constants";

/**
 * Vérifie qu'un fichier est bien une image (JPG/PNG/WebP) et respecte
 * la limite de taille. Retourne `true` si valide, sinon affiche un toast.
 */
export const validateImageFile = (file: File): boolean => {
  if (!file.type.match("image/(jpeg|png|webp)")) {
    toast({
      title: "Invalid file type",
      description: "Please upload only JPG, PNG, or WebP images.",
      variant: "destructive",
    });
    return false;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast({
      title: "File too large",
      description: "Please upload an image smaller than 10MB.",
      variant: "destructive",
    });
    return false;
  }
  return true;
};

/**
 * Upload une image dans le bucket `products` et renvoie son URL publique.
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 15)}.${fileExt}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from("products").getPublicUrl(fileName);
  return data.publicUrl;
};

/**
 * Upload un fichier audio (piste vinyle) dans le bucket `vinyles`.
 * Effectue la validation d'extension et de taille avant l'upload.
 */
export const uploadVinylAudio = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    toast({
      title: "Format non supporté",
      description: "Formats acceptés : MP3, WAV, FLAC, AAC, AIFF.",
      variant: "destructive",
    });
    return null;
  }
  if (file.size > MAX_AUDIO_SIZE) {
    toast({
      title: "Fichier trop volumineux",
      description: "Le fichier audio doit faire moins de 50 MB.",
      variant: "destructive",
    });
    return null;
  }

  const fileName = `tracks/${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from("vinyles")
    .upload(fileName, file, { contentType: file.type || `audio/${ext}` });
  if (error) throw error;
  const { data } = supabase.storage.from("vinyles").getPublicUrl(fileName);
  return data.publicUrl;
};