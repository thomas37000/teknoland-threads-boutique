import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { ImageConfig } from "@/hooks/useImageManagement";

interface ImageUploadFormProps {
  config: ImageConfig;
  uploading: boolean;
  onUpload: (configId: string, file: File) => void;
  onUrlChange: (configId: string, url: string) => void;
  onPreview: (url: string) => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  config,
  uploading,
  onUpload,
  onUrlChange,
  onPreview
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {config.name}
          {config.current_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(config.current_url)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
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
            <Label htmlFor={`file-${config.id}`}>Uploader une nouvelle image</Label>
            <Input
              id={`file-${config.id}`}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUpload(config.id, file);
                }
              }}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-1">
                Upload en cours...
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Taille maximale: 5 Mo pour l'image Hero
            </p>
          </div>

          <div>
            <Label>URL actuelle</Label>
            <Input
              value={config.current_url}
              onChange={(e) => onUrlChange(config.id, e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {config.current_url && (
          <div className="mt-4">
            <Label>Aperçu</Label>
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
  );
};

export default ImageUploadForm;
