import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ImageConfig {
  id: string;
  name: string;
  description: string;
  current_url: string;
  css_variable: string;
}

export interface StorageImage {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

export const useImageManagement = () => {
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>([
    {
      id: 'hero-bg',
      name: 'Image de fond Hero',
      description: 'Image de fond principale utilisée sur la page d\'accueil',
      current_url: '',
      css_variable: '--background-image'
    }
  ]);
  const [storageImages, setStorageImages] = useState<StorageImage[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialHeroUrl, setInitialHeroUrl] = useState('');

  useEffect(() => {
    const storedBgImage = localStorage.getItem('hero-bg-image') || '';
    setInitialHeroUrl(storedBgImage);
    
    setImageConfigs(prev => prev.map(config =>
      config.id === 'hero-bg' ? { ...config, current_url: storedBgImage } : config
    ));

    loadStorageImages();
  }, []);

  useEffect(() => {
    const heroConfig = imageConfigs.find(config => config.id === 'hero-bg');
    setHasChanges(heroConfig?.current_url !== initialHeroUrl);
  }, [imageConfigs, initialHeroUrl]);

  const loadStorageImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('teknoland-img')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const images: StorageImage[] = data?.map(file => ({
        name: file.name,
        url: supabase.storage.from('teknoland-img').getPublicUrl(file.name).data.publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at || ''
      })) || [];

      setStorageImages(images);
    } catch (error) {
      console.error("Error loading storage images:", error);
      toast.error("Erreur lors du chargement des images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (configId: string, file: File) => {
    if (!file) return;

    if (configId === 'hero-bg' && file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo pour l'image de fond Hero");
      return;
    }

    setUploading(configId);

    try {
      const fileName = `${configId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('teknoland-img')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('teknoland-img')
        .getPublicUrl(fileName);

      setImageConfigs(prev => prev.map(config =>
        config.id === configId
          ? { ...config, current_url: publicUrl }
          : config
      ));

      loadStorageImages();
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Échec de l'upload de l'image");
    } finally {
      setUploading(null);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setImageConfigs(prev => prev.map(config =>
      config.id === 'hero-bg'
        ? { ...config, current_url: imageUrl }
        : config
    ));
    toast.success("Image sélectionnée pour le Hero");
  };

  const handleDeleteImage = async (imageName: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const { error } = await supabase.storage
        .from('teknoland-img')
        .remove([imageName]);

      if (error) throw error;

      const imageUrl = supabase.storage.from('teknoland-img').getPublicUrl(imageName).data.publicUrl;
      const heroConfig = imageConfigs.find(config => config.id === 'hero-bg');
      if (heroConfig?.current_url === imageUrl) {
        setImageConfigs(prev => prev.map(config =>
          config.id === 'hero-bg'
            ? { ...config, current_url: '' }
            : config
        ));
      }

      loadStorageImages();
      toast.success("Image supprimée avec succès");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Échec de la suppression de l'image");
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);

    try {
      const heroConfig = imageConfigs.find(config => config.id === 'hero-bg');
      if (heroConfig && heroConfig.current_url) {
        document.documentElement.style.setProperty(
          '--background-image',
          `url(${heroConfig.current_url})`
        );
        localStorage.setItem('hero-bg-image', heroConfig.current_url);
        setInitialHeroUrl(heroConfig.current_url);
        toast.success("Image de fond mise à jour avec succès");
      } else {
        document.documentElement.style.removeProperty('--background-image');
        localStorage.removeItem('hero-bg-image');
        setInitialHeroUrl('');
        toast.success("Image de fond supprimée");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateImageUrl = (configId: string, url: string) => {
    setImageConfigs(prev => prev.map(c =>
      c.id === configId ? { ...c, current_url: url } : c
    ));
  };

  return {
    imageConfigs,
    storageImages,
    uploading,
    saving,
    loading,
    hasChanges,
    handleImageUpload,
    handleSelectImage,
    handleDeleteImage,
    handleSaveChanges,
    loadStorageImages,
    updateImageUrl
  };
};
