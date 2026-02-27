import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Trash2, FileDown } from "lucide-react";
import { StorageImage } from "@/hooks/useImageManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageCardProps {
  image: StorageImage;
  isCurrentHero: boolean;
  onSelect: (url: string) => void;
  onPreview: (url: string) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
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
  onDelete,
  onRefresh
}) => {
  const [compressing, setCompressing] = useState(false);

  const handleCompressToAvif = async () => {
    setCompressing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Impossible de charger l'image"));
        img.src = image.url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas non supporté");
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/avif", 0.7)
      );

      if (!blob || blob.type !== "image/avif") {
        toast.error("Votre navigateur ne supporte pas la compression AVIF. Essayez Chrome ou Edge.");
        return;
      }

      const baseName = image.name.replace(/\.[^.]+$/, "");
      const avifName = `${baseName}.avif`;

      const { error } = await supabase.storage
        .from("teknoland-img")
        .upload(avifName, blob, { contentType: "image/avif", upsert: true });

      if (error) throw error;

      toast.success(`Image compressée en AVIF : ${avifName}`);
      onRefresh();
    } catch (err: any) {
      console.error("Compression AVIF error:", err);
      toast.error(err.message || "Erreur lors de la compression AVIF");
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="relative group">
      <div className="aspect-square border rounded-md overflow-hidden bg-muted">
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
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={handleCompressToAvif}
          disabled={compressing || image.name.endsWith('.avif')}
          title="Compresser en AVIF"
        >
          <FileDown className="h-4 w-4" />
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
