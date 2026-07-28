import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PopupAdmin from "../PopupAdmin";
import CategoryImageField from "./CategoryImageField";
import { Category } from "@/hooks/useCategoryManagement";

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onChange: (category: Category) => void;
  onUpdate: (category: Category) => Promise<boolean>;
  onPickImage: (apply: (url: string) => void) => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onClose,
  category,
  onChange,
  onUpdate,
  onPickImage,
}) => {
  const handleUpdate = async () => {
    if (!category) return;
    const success = await onUpdate(category);
    if (success) onClose();
  };

  return (
    <PopupAdmin isOpen={isOpen} onClose={onClose} title="Modifier la catégorie" maxWidth="w-96">
      {category && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nom de la catégorie</Label>
            <Input
              id="edit-name"
              value={category.name}
              onChange={(e) => onChange({ ...category, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-slug">Slug (URL)</Label>
            <Input
              id="edit-slug"
              value={category.slug}
              onChange={(e) => onChange({ ...category, slug: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={category.description || ""}
              onChange={(e) => onChange({ ...category, description: e.target.value })}
            />
          </div>
          <CategoryImageField
            imageUrl={category.image_url || null}
            onPick={() => onPickImage((url) => onChange({ ...category, image_url: url }))}
            onRemove={() => onChange({ ...category, image_url: null })}
          />
          <div className="flex gap-2">
            <Button onClick={handleUpdate} className="flex-1">Sauvegarder</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          </div>
        </div>
      )}
    </PopupAdmin>
  );
};

export default EditCategoryDialog;