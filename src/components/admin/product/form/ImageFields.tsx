import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { FormRow } from "./FormRow";

const ACCEPT = "image/jpeg,image/png,image/webp";

function StorageButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <ImageIcon className="h-4 w-4 mr-1" />
      Stockage
    </Button>
  );
}

/** Image principale : upload fichier + choix depuis le stockage. */
export function MainImageField({
  id, onFileChange, onOpenStorage, preview, onPreviewClick, showCompressHint,
}: {
  id: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onOpenStorage: () => void;
  preview?: string | null;
  onPreviewClick?: (url: string) => void;
  showCompressHint?: boolean;
}) {
  return (
    <FormRow label="Image principale" htmlFor={id} align="start">
      <div className="space-y-2">
        {preview && (
          <img
            src={preview}
            alt="Aperçu"
            className="h-20 w-auto object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onPreviewClick?.(preview)}
          />
        )}
        <div className="flex gap-2">
          <Input id={id} type="file" accept={ACCEPT} onChange={onFileChange} className="flex-1" />
          <StorageButton onClick={onOpenStorage} />
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Max 10MB.</p>
        {showCompressHint && (
          <div className="text-xs text-muted-foreground">
            Site pour comprésser vos fichiers si suppérier à 10MB: https://compresspng.com/fr/
          </div>
        )}
      </div>
    </FormRow>
  );
}

/** Images supplémentaires (4 max) : existantes + nouveaux fichiers. */
export function AdditionalImagesField({
  id, existing = [], files = [], onFileChange, onRemoveFile, onOpenStorage, onPreviewClick, hint,
}: {
  id: string;
  existing?: string[];
  files?: File[];
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onOpenStorage: () => void;
  onPreviewClick?: (url: string) => void;
  hint: string;
}) {
  return (
    <FormRow label="Images supplémentaires (4 max)" htmlFor={id} align="start">
      {existing.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {existing.map((img, i) => (
            <div key={i} className="relative border rounded p-2">
              <img
                src={img}
                alt={`Image ${i}`}
                className="h-20 w-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onPreviewClick?.(img)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input id={id} type="file" accept={ACCEPT} onChange={onFileChange} className="flex-1" disabled={files.length >= 4} />
        <StorageButton onClick={onOpenStorage} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {files.map((file, i) => (
            <div key={i} className="relative border rounded p-2">
              <img src={URL.createObjectURL(file)} alt={`Preview ${i}`} className="h-20 w-full object-contain" />
              <button
                type="button"
                onClick={() => onRemoveFile(i)}
                className="absolute top-1 right-1 bg-background rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </FormRow>
  );
}
