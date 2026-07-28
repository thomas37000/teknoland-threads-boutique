import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StorageImagePicker from "./product/StorageImagePicker";
import AddCategoryDialog from "./categories/AddCategoryDialog";
import EditCategoryDialog from "./categories/EditCategoryDialog";
import CategoryTable from "./categories/CategoryTable";
import { Category, useCategoryManagement } from "@/hooks/useCategoryManagement";

const CategoryManagement = () => {
  const { categories, loading, addCategory, updateCategory, toggleCategoryStatus, deleteCategory } =
    useCategoryManagement();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerCallbackRef = useRef<((url: string) => void) | null>(null);

  const handlePickImage = (apply: (url: string) => void) => {
    pickerCallbackRef.current = apply;
    setPickerOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
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
        <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addCategory}
        onPickImage={handlePickImage}
      />

      <CategoryTable
        categories={categories}
        onToggleStatus={toggleCategoryStatus}
        onEdit={handleEdit}
        onDelete={deleteCategory}
      />

      <EditCategoryDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEdit}
        category={currentCategory}
        onChange={setCurrentCategory}
        onUpdate={updateCategory}
        onPickImage={handlePickImage}
      />

      <StorageImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          pickerCallbackRef.current?.(url);
        }}
      />
    </div>
  );
};

export default CategoryManagement;
