import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageConfig {
  id: string;
  name: string;
  description: string;
  current_url: string;
  css_variable: string;
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
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get current background image from CSS variable
    const currentBg = getComputedStyle(document.documentElement)
      .getPropertyValue('--background-image')
      .replace('url(', '')
      .replace(')', '')
      .replace(/"/g, '');

    setImageConfigs(prev => prev.map(config =>
      config.id === 'hero-bg' ? { ...config, current_url: currentBg } : config
    ));
  }, []);

  const handleImageUpload = async (configId: string, file: File) => {
    if (!file) return;

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

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(null);
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

         // Get public URL of the uploaded image
        await supabase
          .from('settings')
          .upsert({
            id: '0426c36c-d153-4a16-8962-1fae3c9f6030',
            hero_bg: heroConfig.current_url
          });

        toast.success("Background image updated successfully");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const previewImage = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Images</h2>
        <Button
          onClick={handleSaveChanges}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

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
                  Preview
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
                <Label htmlFor={`file-${config.id}`}>Upload New Image</Label>
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
                    Uploading...
                  </p>
                )}
              </div>

              <div>
                <Label>Current URL</Label>
                <Input
                  value={config.current_url}
                  accept="image/jpeg,image/png,image/webp"
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
                <Label>Preview</Label>
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
    </div>
  );
};

export default ImageManagement;