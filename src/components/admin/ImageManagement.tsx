import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useImageManagement } from "@/hooks/useImageManagement";
import ImageUploadForm from "./images/ImageUploadForm";
import ImageGallery from "./images/ImageGallery";

const ImageManagement = () => {
  const {
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
  } = useImageManagement();

  const previewImage = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const heroConfig = imageConfigs.find(config => config.id === 'hero-bg');

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

      {heroConfig && (
        <ImageUploadForm
          config={heroConfig}
          uploading={uploading === heroConfig.id}
          onUpload={handleImageUpload}
          onUrlChange={updateImageUrl}
          onPreview={previewImage}
        />
      )}

      <ImageGallery
        images={storageImages}
        loading={loading}
        currentHeroUrl={heroConfig?.current_url || ''}
        onRefresh={loadStorageImages}
        onSelect={handleSelectImage}
        onPreview={previewImage}
        onDelete={handleDeleteImage}
      />
    </div>
  );
};

export default ImageManagement;