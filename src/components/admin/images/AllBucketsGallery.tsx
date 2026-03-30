import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image as ImageIcon, Loader2, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageCard from "./ImageCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StorageImage {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

const ITEMS_PER_PAGE = 30;

const AllBucketsGallery = () => {
  const { buckets: BUCKETS, loading: bucketsLoading } = useBuckets();
  const [activeBucket, setActiveBucket] = useState<string>("");
  const [images, setImages] = useState<Record<string, StorageImage[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadBucket = useCallback(async (bucket: string) => {
    setLoading((prev) => ({ ...prev, [bucket]: true }));
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
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

  const handleDelete = (name: string) => {
    setDeleteTarget(name);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.storage.from(activeBucket).remove([deleteTarget]);
      if (error) throw error;
      toast.success("Image supprimée");
      loadBucket(activeBucket);
    } catch (err: any) {
      toast.error(err.message || "Erreur suppression");
    } finally {
      setDeleteTarget(null);
    }
  };

  const previewImage = (url: string) => {
    if (url) setPreviewUrl(url);
  };

  const getPage = (bucket: string) => currentPage[bucket] || 1;
  const getBucketImages = (bucket: string) => images[bucket] || [];
  const getFilteredImages = useCallback((bucket: string) => {
    const all = getBucketImages(bucket);
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter((img) => img.name.toLowerCase().includes(q));
  }, [images, searchQuery]);
  const getTotalPages = (bucket: string) => Math.ceil(getFilteredImages(bucket).length / ITEMS_PER_PAGE);
  const getPaginatedImages = (bucket: string) => {
    const page = getPage(bucket);
    const filtered = getFilteredImages(bucket);
    return filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  };
  const setPage = (bucket: string, page: number) => {
    setCurrentPage((prev) => ({ ...prev, [bucket]: page }));
  };

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
        <Tabs value={activeBucket} onValueChange={(v) => { setActiveBucket(v); setSearchQuery(""); }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <TabsList className="flex-wrap">
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
            <div className="relative sm:ml-auto w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un fichier…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage({}); }}
                className="pl-9 pr-8 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage({}); }}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {BUCKETS.map((bucket) => {
            const totalPages = getTotalPages(bucket);
            const page = getPage(bucket);
            const paginated = getPaginatedImages(bucket);

            return (
              <TabsContent key={bucket} value={bucket}>
                {(loading[bucket] ?? false) ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : getBucketImages(bucket).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Aucune image dans {bucket}
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {paginated.map((image) => (
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
                    {totalPages > 1 && (
                      <Pagination className="mt-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage(bucket, Math.max(1, page - 1))}
                              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink
                                isActive={p === page}
                                onClick={() => setPage(bucket, p)}
                                className="cursor-pointer"
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage(bucket, Math.min(totalPages, page + 1))}
                              className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le fichier <span className="font-medium">{deleteTarget}</span> sera définitivement supprimé du bucket <span className="font-medium">{activeBucket}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl p-2">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Aperçu"
                className="w-full h-auto max-h-[80vh] object-contain rounded-md"
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AllBucketsGallery;
