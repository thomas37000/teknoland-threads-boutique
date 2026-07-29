import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { MAX_ADDITIONAL_IMAGES } from "../constants";
import { validateImageFile } from "../utils/uploads";

/**
 * Regroupe la gestion des fichiers images (principale + additionnelles)
 * pour les modes ajout et édition. Fournit les handlers utilisés par
 * les dialogues.
 */
export const useProductImageFiles = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [editMultipleImageFiles, setEditMultipleImageFiles] = useState<File[]>([]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) return;
    if (isEdit) setEditImageFile(file);
    else setImageFile(file);
  };

  const handleMultipleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean,
  ) => {
    const files = e.target.files;
    if (!files) return;
    const selectedFiles = Array.from(files);

    const currentCount = isEdit
      ? editMultipleImageFiles.length
      : multipleImageFiles.length;
    if (currentCount + selectedFiles.length > MAX_ADDITIONAL_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of ${MAX_ADDITIONAL_IMAGES} images.`,
        variant: "destructive",
      });
      return;
    }

    for (const file of selectedFiles) {
      if (!validateImageFile(file)) return;
    }

    if (isEdit) {
      setEditMultipleImageFiles((prev) =>
        [...prev, ...selectedFiles].slice(0, MAX_ADDITIONAL_IMAGES),
      );
    } else {
      setMultipleImageFiles((prev) =>
        [...prev, ...selectedFiles].slice(0, MAX_ADDITIONAL_IMAGES),
      );
    }
  };

  const resetAdd = () => {
    setImageFile(null);
    setMultipleImageFiles([]);
  };

  const resetEdit = () => {
    setEditImageFile(null);
    setEditMultipleImageFiles([]);
  };

  return {
    imageFile,
    editImageFile,
    multipleImageFiles,
    editMultipleImageFiles,
    handleImageChange,
    handleMultipleImageChange,
    resetAdd,
    resetEdit,
  };
};