import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PopupAdmin from "../PopupAdmin";
import CategoryImageField from "./CategoryImageField";
import { EMPTY_CATEGORY, NewCategoryData } from "@/hooks/useCategoryManagement";

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: NewCategoryData) => Promise<boolean>;
  onPickImage: (apply: (url: string) => void) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ isOpen, onClose, onAdd, onPickImage }) => {
  const [newCategory, setNewCategory] = useState<NewCategoryData>(EMPTY_CATEGORY);

  const handleAdd = async () => {
    const success = await onAdd(newCategory);
    if (success) {
      setNewCategory(EMPTY_CATEGORY);
      onClose();
    }
  };

  return (
    <PopupAdmin isOpen={isOpen} onClose={onClose} title="Ajouter une nouvelle catégorie" maxWidth="w-96">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de la catégorie</Label>
          <Input
            id="name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Ex: T-Shirts Premium"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={newCategory.slug}
            onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
            placeholder="Ex: t-shirts-premium"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            placeholder="Description de la catégorie"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={newCategory.is_active}
            onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
          />
          <Label htmlFor="is_active">Catégorie active</Label>
        </div>
        <CategoryImageField
          imageUrl={newCategory.image_url || null}
          onPick={() => onPickImage((url) => setNewCategory((prev) => ({ ...prev, image_url: url })))}
          onRemove={() => setNewCategory({ ...newCategory, image_url: "" })}
        />
        <div className="flex gap-2">
          <Button onClick={handleAdd} className="flex-1">Ajouter</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
        </div>
      </div>
    </PopupAdmin>
  );
};

export default AddCategoryDialog;