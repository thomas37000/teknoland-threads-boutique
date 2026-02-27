import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { StorageImage } from "@/hooks/useImageManagement";
import ImageCard from "./ImageCard";

interface ImageGalleryProps {
  images: StorageImage[];
  loading: boolean;
  currentHeroUrl: string;
  onRefresh: () => void;
  onSelect: (url: string) => void;
  onPreview: (url: string) => void;
  onDelete: (name: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  loading,
  currentHeroUrl,
  onRefresh,
  onSelect,
  onPreview,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galerie d'images (Storage)
        </CardTitle>
        <Button
          onClick={onRefresh}
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
        ) : images.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune image trouvée dans le storage</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.name}
                image={image}
                isCurrentHero={currentHeroUrl === image.url}
                onSelect={onSelect}
                onPreview={onPreview}
                onDelete={onDelete}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGallery;
