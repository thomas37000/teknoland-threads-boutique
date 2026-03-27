import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StorageImage {
  name: string;
  url: string;
  size: number;
}

interface StorageImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
}

const BUCKETS = ["products", "sweats", "teknoland-img", "tshirts"] as const;

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const StorageImagePicker: React.FC<StorageImagePickerProps> = ({
  open,
  onClose,
  onSelect,
  multiple = false,
  onSelectMultiple,
}) => {
  const [images, setImages] = useState<Record<string, StorageImage[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [activeBucket, setActiveBucket] = useState<string>(BUCKETS[0]);

  useEffect(() => {
    if (open) {
      loadAllBuckets();
      setSelectedUrls([]);
    }
  }, [open]);

  const loadAllBuckets = async () => {
    setLoading(true);
    const result: Record<string, StorageImage[]> = {};
    await Promise.all(
      BUCKETS.map(async (bucket) => {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
          if (error) throw error;
          result[bucket] = (data || [])
            .filter((f) => !f.name.startsWith("."))
            .map((file) => ({
              name: file.name,
              url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
              size: file.metadata?.size || 0,
            }));
        } catch {
          result[bucket] = [];
        }
      })
    );
    setImages(result);
    setLoading(false);
  };

  const toggleSelect = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      onSelect(url);
      onClose();
    }
  };

  const confirmMultiple = () => {
    if (onSelectMultiple) onSelectMultiple(selectedUrls);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Choisir depuis le stockage
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeBucket} onValueChange={setActiveBucket}>
          <TabsList>
            {BUCKETS.map((b) => (
              <TabsTrigger key={b} value={b}>
                {b}
              </TabsTrigger>
            ))}
          </TabsList>

          {BUCKETS.map((bucket) => (
            <TabsContent key={bucket} value={bucket}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !images[bucket]?.length ? (
                <p className="text-center py-8 text-muted-foreground">Aucune image</p>
              ) : (
                <ScrollArea className="h-[50vh]">
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {images[bucket].map((img) => {
                      const isSelected = selectedUrls.includes(img.url);
                      return (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => toggleSelect(img.url)}
                          className={`relative group rounded-md overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="aspect-square bg-muted">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <div className="p-1">
                            <p className="text-[10px] truncate">{img.name}</p>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              {formatFileSize(img.size)}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {multiple && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedUrls.length} image(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={confirmMultiple} disabled={selectedUrls.length === 0}>
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StorageImagePicker;
