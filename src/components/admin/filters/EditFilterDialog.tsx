import React from "react";
import { Button } from "@/components/ui/button";
import PopupAdmin from "../PopupAdmin";
import FilterForm from "./FilterForm";
import { ShopFilter } from "@/hooks/useFilterManagement";

interface EditFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filter: ShopFilter | null;
  onUpdate: (filter: ShopFilter) => Promise<boolean>;
  onChange: (filter: ShopFilter) => void;
}

const EditFilterDialog: React.FC<EditFilterDialogProps> = ({
  isOpen,
  onClose,
  filter,
  onUpdate,
  onChange
}) => {
  if (!filter) return null;

  const handleUpdate = async () => {
    const success = await onUpdate(filter);
    if (success) {
      onClose();
    }
  };

  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le filtre"
      maxWidth="w-96"
    >
      <FilterForm
        name={filter.name}
        type={filter.type}
        options={filter.options?.join(", ") || ""}
        isActive={filter.is_active}
        onNameChange={(value) => onChange({ ...filter, name: value })}
        onOptionsChange={(value) => onChange({
          ...filter,
          options: value ? value.split(",").map(o => o.trim()) : null
        })}
        onIsActiveChange={(value) => onChange({ ...filter, is_active: value })}
        showTypeSelector={false}
      />
      <div className="flex gap-2 mt-4">
        <Button onClick={handleUpdate} className="flex-1">Sauvegarder</Button>
        <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
      </div>
    </PopupAdmin>
  );
};

export default EditFilterDialog;
