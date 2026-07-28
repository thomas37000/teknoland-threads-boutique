import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";

interface CategoryImageFieldProps {
  imageUrl: string | null;
  onPick: () => void;
  onRemove: () => void;
}

const CategoryImageField: React.FC<CategoryImageFieldProps> = ({ imageUrl, onPick, onRemove }) => (
  <div>
    <Label>Image de la catégorie</Label>
    <p className="text-xs text-muted-foreground mt-1">
      Taille conseillée : 800 × 600 px (ratio 4:3) pour un rendu optimal sur les cartes.
    </p>
    <div className="flex items-center gap-3 mt-2">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-16 w-16 rounded object-cover border" />
      ) : (
        <div className="h-16 w-16 rounded border flex items-center justify-center bg-muted">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onPick}>
        Choisir une image
      </Button>
      {imageUrl && (
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Retirer
        </Button>
      )}
    </div>
  </div>
);

export default CategoryImageField;