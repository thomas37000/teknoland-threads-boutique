import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFilterManagement, ShopFilter } from "@/hooks/useFilterManagement";
import FilterTable from "./filters/FilterTable";
import AddFilterDialog from "./filters/AddFilterDialog";
import EditFilterDialog from "./filters/EditFilterDialog";

const FilterManagement = () => {
  const {
    filters,
    loading,
    addFilter,
    updateFilter,
    toggleFilterStatus,
    deleteFilter
  } = useFilterManagement();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ShopFilter | null>(null);

  const handleEdit = (filter: ShopFilter) => {
    setCurrentFilter(filter);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setCurrentFilter(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tekno-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Filtres</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un filtre
        </Button>
      </div>

      <FilterTable
        filters={filters}
        onToggleStatus={toggleFilterStatus}
        onEdit={handleEdit}
        onDelete={deleteFilter}
      />

      <AddFilterDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addFilter}
      />

      <EditFilterDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEdit}
        filter={currentFilter}
        onUpdate={updateFilter}
        onChange={setCurrentFilter}
      />
    </div>
  );
};

export default FilterManagement;
