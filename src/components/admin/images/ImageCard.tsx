import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Eye, Trash2, FileDown, ImageDown, FolderInput, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StorageImage } from "@/hooks/useImageManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageCardProps {
  image: StorageImage;
  isCurrentHero: boolean;
  sourceBucket?: string;
  allBuckets?: string[];
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
  sourceBucket = "products",
  allBuckets = [],
  onSelect,
  onPreview,
  onDelete,
  onRefresh
}) => {
  const [compressing, setCompressing] = useState(false);
  const [moving, setMoving] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);

  const handleRename = async () => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === image.name) {
      setRenameOpen(false);
      return;
    }
    setRenaming(true);
    try {
      const { data, error: dlError } = await supabase.storage
        .from(sourceBucket)
        .download(image.name);
      if (dlError || !data) throw dlError || new Error("Téléchargement échoué");

      const { error: upError } = await supabase.storage
        .from(sourceBucket)
        .upload(trimmed, data, { upsert: false });
      if (upError) throw upError;

      const { error: rmError } = await supabase.storage
        .from(sourceBucket)
        .remove([image.name]);
      if (rmError) throw rmError;

      toast.success(`Renommé en ${trimmed}`);
      onRefresh();
    } catch (err: any) {
      console.error("Rename error:", err);
      toast.error(err.message || "Erreur lors du renommage");
    } finally {
      setRenaming(false);
      setRenameOpen(false);
    }
  };

  const moveToB = async (targetBucket: string) => {
    if (targetBucket === sourceBucket) return;
    setMoving(true);
    try {
      const { data, error: dlError } = await supabase.storage
        .from(sourceBucket)
        .download(image.name);
      if (dlError || !data) throw dlError || new Error("Téléchargement échoué");

      const { error: upError } = await supabase.storage
        .from(targetBucket)
        .upload(image.name, data, { upsert: true });
      if (upError) throw upError;

      const { error: rmError } = await supabase.storage
        .from(sourceBucket)
        .remove([image.name]);
      if (rmError) throw rmError;

      toast.success(`Image déplacée vers ${targetBucket}`);
      onRefresh();
    } catch (err: any) {
      console.error("Move error:", err);
      toast.error(err.message || "Erreur lors du déplacement");
    } finally {
      setMoving(false);
    }
  };

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
        toast.error(`Votre navigateur ne supporte pas la compression ${label}. Essayez Chrome ou Edge.`);
        return;
      }

      const baseName = image.name.replace(/\.[^.]+$/, "");
      const newName = `${baseName}.${format}`;

      const { error } = await supabase.storage
        .from("teknoland-img")
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

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-[1px]">
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
          onClick={() => compressTo("avif")}
          disabled={compressing || image.name.endsWith('.avif')}
          title="Compresser en AVIF"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => compressTo("webp")}
          disabled={compressing || image.name.endsWith('.webp')}
          title="Compresser en WebP"
        >
          <ImageDown className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              disabled={moving}
              title="Déplacer vers un bucket"
            >
              <FolderInput className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {MOVE_BUCKETS.filter((b) => b !== sourceBucket).map((bucket) => (
              <DropdownMenuItem key={bucket} onClick={() => moveToB(bucket)}>
                {bucket}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={() => {
            setNewName(image.name);
            setRenameOpen(true);
          }}
          title="Renommer"
        >
          <Pencil className="h-4 w-4" />
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

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Renommer l'image</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouveau nom de fichier"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRename} disabled={renaming}>
              {renaming ? "Renommage..." : "Renommer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCard;
