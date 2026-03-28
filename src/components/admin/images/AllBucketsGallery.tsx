import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageCard from "./ImageCard";

interface StorageImage {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

const BUCKETS = ["products", "stickers", "sweats", "teknoland-img", "tshirts"] as const;

const AllBucketsGallery = () => {
  const [activeBucket, setActiveBucket] = useState<string>(BUCKETS[0]);
  const [images, setImages] = useState<Record<string, StorageImage[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);

  const loadBucket = useCallback(async (bucket: string) => {
    setLoading((prev) => ({ ...prev, [bucket]: true }));
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      const mapped: StorageImage[] = (data || [])
        .filter((f) => !f.name.startsWith("."))
        .map((file) => ({
          name: file.name,
          url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at || "",
        }));
      setImages((prev) => ({ ...prev, [bucket]: mapped }));
    } catch (err: any) {
      console.error(`Error loading ${bucket}:`, err);
      toast.error(`Erreur chargement ${bucket}`);
    } finally {
      setLoading((prev) => ({ ...prev, [bucket]: false }));
    }
  }, []);

  useEffect(() => {
    loadBucket(activeBucket);
  }, [activeBucket, loadBucket]);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5 Mo");
      return;
    }
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(activeBucket).upload(fileName, file);
      if (error) throw error;
      toast.success(`Image uploadée dans ${activeBucket}`);
      loadBucket(activeBucket);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      const { error } = await supabase.storage.from(activeBucket).remove([name]);
      if (error) throw error;
      toast.success("Image supprimée");
      loadBucket(activeBucket);
    } catch (err: any) {
      toast.error(err.message || "Erreur suppression");
    }
  };

  const previewImage = (url: string) => {
    if (url) window.open(url, "_blank");
  };

  const bucketImages = images[activeBucket] || [];
  const isLoading = loading[activeBucket] ?? false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galeries de stockage
        </CardTitle>
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="bucket-img-upload" className="sr-only">Importer une image</Label>
            <Input
              id="bucket-img-upload"
              type="file"
              accept="image/*"
              className="max-w-[220px]"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
          </div>
          <Button onClick={() => loadBucket(activeBucket)} variant="outline" size="sm" disabled={isLoading}>
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeBucket} onValueChange={setActiveBucket}>
          <TabsList className="mb-4 flex-wrap">
            {BUCKETS.map((b) => (
              <TabsTrigger key={b} value={b} className="capitalize">
                {b}
                {images[b] && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                    {images[b].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {BUCKETS.map((bucket) => (
            <TabsContent key={bucket} value={bucket}>
              {(loading[bucket] ?? false) ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (images[bucket] || []).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune image dans {bucket}
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(images[bucket] || []).map((image) => (
                    <ImageCard
                      key={image.name}
                      image={image}
                      isCurrentHero={false}
                      sourceBucket={bucket}
                      onSelect={() => {}}
                      onPreview={previewImage}
                      onDelete={handleDelete}
                      onRefresh={() => loadBucket(bucket)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AllBucketsGallery;
