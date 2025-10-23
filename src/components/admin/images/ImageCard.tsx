import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Trash2 } from "lucide-react";
import { StorageImage } from "@/hooks/useImageManagement";

interface ImageCardProps {
  image: StorageImage;
  isCurrentHero: boolean;
  onSelect: (url: string) => void;
  onPreview: (url: string) => void;
  onDelete: (name: string) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isCurrentHero,
  onSelect,
  onPreview,
  onDelete
}) => {
  return (
    <div className="relative group">
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
      
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {formatFileSize(image.size)}
          </Badge>
          {isCurrentHero && (
            <Badge variant="default" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Actuel
            </Badge>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => onSelect(image.url)}
          title="Utiliser pour Hero"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => onPreview(image.url)}
          title="Aperçu"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0"
          onClick={() => onDelete(image.name)}
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImageCard;
