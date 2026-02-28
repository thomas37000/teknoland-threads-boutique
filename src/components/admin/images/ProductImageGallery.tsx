import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Eye, Trash2, FileDown, ImageDown, Upload } from "lucide-react";
import { useProductImages } from "@/hooks/useProductImages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const ProductImageGallery = () => {
  const { images, loading, uploading, uploadImage, deleteImage, loadImages } = useProductImages();

  const previewImage = (url: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <PackageOpen className="h-5 w-5" />
          Galerie d'images Produits (Storage)
        </CardTitle>
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="product-img-upload" className="sr-only">
              Importer une image
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="product-img-upload"
                type="file"
                accept="image/*"
                className="max-w-[220px]"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.target.value = "";
                }}
              />
              {uploading && <span className="text-sm text-muted-foreground">Upload…</span>}
            </div>
          </div>
          <Button onClick={loadImages} variant="outline" size="sm" disabled={loading}>
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement des images produits…</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune image trouvée dans le bucket products</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ProductImageCard
                key={image.name}
                image={image}
                onPreview={previewImage}
                onDelete={deleteImage}
                onRefresh={loadImages}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ---- card interne ---- */

interface ProductImageCardProps {
  image: { name: string; url: string; size: number };
  onPreview: (url: string) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
}

const ProductImageCard: React.FC<ProductImageCardProps> = ({ image, onPreview, onDelete, onRefresh }) => {
  const [compressing, setCompressing] = useState(false);

  const compressTo = async (format: "avif" | "webp") => {
    setCompressing(true);
    const mimeType = format === "avif" ? "image/avif" : "image/webp";
    const label = format.toUpperCase();
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
        canvas.toBlob((b) => resolve(b), mimeType, 0.7)
      );

      if (!blob || blob.type !== mimeType) {
        toast.error(`Votre navigateur ne supporte pas la compression ${label}.`);
        return;
      }

      const baseName = image.name.replace(/\.[^.]+$/, "");
      const newName = `${baseName}.${format}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(newName, blob, { contentType: mimeType, upsert: true });

      if (error) throw error;

      toast.success(`Image compressée en ${label} : ${newName}`);
      onRefresh();
    } catch (err: any) {
      console.error(`Compression ${label} error:`, err);
      toast.error(err.message || `Erreur lors de la compression ${label}`);
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
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium truncate" title={image.name}>
          {image.name}
        </p>
        <Badge variant="outline" className="text-xs">
          {formatFileSize(image.size)}
        </Badge>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-[1px]">
        <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => onPreview(image.url)} title="Aperçu">
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => compressTo("avif")}
          disabled={compressing || image.name.endsWith(".avif")}
          title="Compresser en AVIF"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => compressTo("webp")}
          disabled={compressing || image.name.endsWith(".webp")}
          title="Compresser en WebP"
        >
          <ImageDown className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => onDelete(image.name)} title="Supprimer">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductImageGallery;
