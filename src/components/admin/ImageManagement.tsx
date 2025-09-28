import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Eye, Save, Trash2, Check, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageConfig {
  id: string;
  name: string;
  description: string;
  current_url: string;
  css_variable: string;
}

interface StorageImage {
  name: string;
  url: string;
  size: number;  
  created_at: string;
}

const ImageManagement = () => {
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
    // Get current background image from localStorage
    const storedBgImage = localStorage.getItem('hero-bg-image') || '';
    setInitialHeroUrl(storedBgImage);
    
    setImageConfigs(prev => prev.map(config =>
      config.id === 'hero-bg' ? { ...config, current_url: storedBgImage } : config
    ));

    // Load storage images
    loadStorageImages();
  }, []);

  // Check for changes
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

    // Validate file size (5MB max for hero background)
    if (configId === 'hero-bg' && file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo pour l'image de fond Hero");
      return;
    }

    setUploading(configId);

    try {
      // Upload to Supabase Storage
      const fileName = `${configId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('teknoland-img')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('teknoland-img')
        .getPublicUrl(fileName);

      // Update local state
      setImageConfigs(prev => prev.map(config =>
        config.id === configId
          ? { ...config, current_url: publicUrl }
          : config
      ));

      // Reload storage images
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

      // If the deleted image was the hero image, clear it
      const imageUrl = supabase.storage.from('teknoland-img').getPublicUrl(imageName).data.publicUrl;
      const heroConfig = imageConfigs.find(config => config.id === 'hero-bg');
      if (heroConfig?.current_url === imageUrl) {
        setImageConfigs(prev => prev.map(config =>
          config.id === 'hero-bg'
            ? { ...config, current_url: '' }
            : config
        ));
      }

      // Reload storage images
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
        // Update CSS variable dynamically
        document.documentElement.style.setProperty(
          '--background-image',
          `url(${heroConfig.current_url})`
        );

        // Store in localStorage for persistence
        localStorage.setItem('hero-bg-image', heroConfig.current_url);
        setInitialHeroUrl(heroConfig.current_url);

        toast.success("Image de fond mise à jour avec succès");
      } else {
        // Clear background image
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

  const previewImage = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Images</h2>
        <Button
          onClick={handleSaveChanges}
          disabled={saving || !hasChanges}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {/* Configuration Hero Image */}
      {imageConfigs.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {config.name}
              {config.current_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewImage(config.current_url)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`file-${config.id}`}>Uploader une nouvelle image</Label>
                <Input
                  id={`file-${config.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(config.id, file);
                    }
                  }}
                  disabled={uploading === config.id}
                />
                {uploading === config.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload en cours...
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Taille maximale: 5 Mo pour l'image Hero
                </p>
              </div>

              <div>
                <Label>URL actuelle</Label>
                <Input
                  value={config.current_url}
                  onChange={(e) => {
                    setImageConfigs(prev => prev.map(c =>
                      c.id === config.id
                        ? { ...c, current_url: e.target.value }
                        : c
                    ));
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>

            {config.current_url && (
              <div className="mt-4">
                <Label>Aperçu</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img
                    src={config.current_url}
                    alt={config.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Images Storage Gallery */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galerie d'images (Storage)
          </CardTitle>
          <Button
            onClick={loadStorageImages}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des images...</p>
            </div>
          ) : storageImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune image trouvée dans le storage</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {storageImages.map((image) => (
                <div key={image.name} className="relative group">
                  <div className="aspect-square border rounded-md overflow-hidden bg-gray-50">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Image info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium truncate" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(image.size)}
                      </Badge>
                      {imageConfigs.find(config => config.current_url === image.url) && (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Actuel
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => handleSelectImage(image.url)}
                      title="Utiliser pour Hero"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => previewImage(image.url)}
                      title="Aperçu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteImage(image.name)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageManagement;