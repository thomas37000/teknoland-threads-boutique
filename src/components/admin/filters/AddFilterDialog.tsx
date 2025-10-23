import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import PopupAdmin from "../PopupAdmin";
import FilterForm from "./FilterForm";
import { NewFilterData } from "@/hooks/useFilterManagement";

interface AddFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (filter: NewFilterData) => Promise<boolean>;
}

const AddFilterDialog: React.FC<AddFilterDialogProps> = ({ isOpen, onClose, onAdd }) => {
  const [newFilter, setNewFilter] = useState<NewFilterData>({
    name: "",
    type: "category",
    is_active: true,
    display_order: 0,
    options: ""
  });

  const handleAdd = async () => {
    const success = await onAdd(newFilter);
    if (success) {
      setNewFilter({
        name: "",
        type: "category",
        is_active: true,
        display_order: 0,
        options: ""
      });
      onClose();
    }
  };

  return (
    <PopupAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un nouveau filtre"
      maxWidth="w-96"
    >
      <FilterForm
        name={newFilter.name}
        type={newFilter.type}
        options={newFilter.options}
        isActive={newFilter.is_active}
        onNameChange={(value) => setNewFilter({ ...newFilter, name: value })}
        onTypeChange={(value: any) => setNewFilter({ ...newFilter, type: value })}
        onOptionsChange={(value) => setNewFilter({ ...newFilter, options: value })}
        onIsActiveChange={(value) => setNewFilter({ ...newFilter, is_active: value })}
        showTypeSelector={true}
      />
      <div className="flex gap-2 mt-4">
        <Button onClick={handleAdd} className="flex-1">Ajouter</Button>
        <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
      </div>
    </PopupAdmin>
  );
};

export default AddFilterDialog;
