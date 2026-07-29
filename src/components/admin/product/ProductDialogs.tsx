import { toast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { AddProductDialog } from "./AddProductDialog";
import { EditProductDialog } from "./EditProducDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
import {
  CATEGORIES,
  COLOR_OPTIONS,
  SIMPLE_STOCK_CATEGORIES,
  SIZE_OPTIONS,
  VINYL_CATEGORIES,
  CATEGORIES_WITHOUT_VARIATIONS,
} from "./dialogs/constants";
import { useProductImageFiles } from "./dialogs/hooks/useProductImageFiles";
import { useProductVariations } from "./dialogs/hooks/useProductVariations";
import { useVinylTracks } from "./dialogs/hooks/useVinylTracks";
import { addProduct, editProduct } from "./dialogs/hooks/useProductSubmit";

interface ProductDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  newProduct: Partial<Product>;
  setNewProduct: (product: Partial<Product>) => void;
  currentProduct: Product | null;
  setCurrentProduct: (product: Product | null) => void;
  handleAddProduct: () => void;
  handleEditProduct: () => void;
  handleDeleteProduct: () => void;
}

/**
 * Orchestrateur des dialogues d'ajout / édition / suppression de produit.
 * La logique métier (upload, variations, pistes vinyle, submit) est
 * déléguée aux hooks du dossier `./dialogs/`.
 */
const ProductDialogs = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  newProduct,
  setNewProduct,
  currentProduct,
  setCurrentProduct,
  handleAddProduct,
  handleEditProduct,
  handleDeleteProduct,
}: ProductDialogsProps) => {
  const categorySelected = newProduct?.category;
  const showVariations =
    !!categorySelected && !CATEGORIES_WITHOUT_VARIATIONS.includes(categorySelected);
  const showVinylTracks =
    !!categorySelected && VINYL_CATEGORIES.includes(categorySelected);
  const showSimpleStock =
    !!categorySelected && SIMPLE_STOCK_CATEGORIES.includes(categorySelected);

  const {
    imageFile,
    editImageFile,
    multipleImageFiles,
    editMultipleImageFiles,
    handleImageChange,
    handleMultipleImageChange,
    resetAdd: resetAddImages,
    resetEdit: resetEditImages,
  } = useProductImageFiles();

  const {
    variations,
    editVariations,
    addVariation,
    removeVariation,
    updateVariation,
  } = useProductVariations(currentProduct, isAddDialogOpen);

  const {
    vinylTracks,
    editVinylTracks,
    setVinylTracks,
    updateVinylTrack,
    handleVinylAudioUpload,
  } = useVinylTracks(currentProduct, categorySelected);

  const handleAddWithImage = async () => {
    try {
      const ok = await addProduct({
        newProduct,
        variations,
        vinylTracks,
        imageFile,
        multipleImageFiles,
      });
      if (!ok) return;

      toast({ title: "Success", description: "Product added successfully" });

      setNewProduct({
        name: "",
        description: "",
        price: 0,
        image: "",
        images: [],
        category: CATEGORIES[0],
        stock: 0,
        sizes: [],
        colors: [],
        size_stocks: {},
      });
      resetAddImages();
      setVinylTracks([]);
      setIsAddDialogOpen(false);
      handleAddProduct();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditWithImage = async () => {
    if (!currentProduct) return;
    try {
      const ok = await editProduct({
        currentProduct,
        editVariations,
        editVinylTracks,
        editImageFile,
        editMultipleImageFiles,
      });
      if (!ok) return;

      toast({ title: "Success", description: "Product updated successfully" });
      resetEditImages();
      setIsEditDialogOpen(false);
      handleEditProduct();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <AddProductDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onConfirm={handleAddWithImage} 
        newProduct={newProduct} 
        setNewProduct={setNewProduct}
        handleImageChange={handleImageChange}
        handleMultipleImageChange={handleMultipleImageChange}
        multipleImageFiles={multipleImageFiles}
        variations={variations}
        showVariations={showVariations}
        addVariation={addVariation}
        removeVariation={removeVariation}
        updateVariation={updateVariation}
        showVinylTracks={showVinylTracks}
        vinylTracks={vinylTracks}
        updateVinylTrack={updateVinylTrack}
        handleVinylAudioUpload={handleVinylAudioUpload}
        showSimpleStock={showSimpleStock}
        CATEGORIES={CATEGORIES}
        COLOR_OPTIONS={COLOR_OPTIONS}
        SIZE_OPTIONS={SIZE_OPTIONS}
      />

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleEditWithImage}
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
        handleImageChange={handleImageChange}
        handleMultipleImageChange={handleMultipleImageChange}
        addVariation={addVariation}
        editVariations={editVariations}
        removeVariation={removeVariation}
        updateVariation={updateVariation}
        editMultipleImageFiles={editMultipleImageFiles}
        editVinylTracks={editVinylTracks}
        updateVinylTrack={updateVinylTrack}
        handleVinylAudioUpload={handleVinylAudioUpload}
        CATEGORIES={CATEGORIES}
        COLOR_OPTIONS={COLOR_OPTIONS}
        SIZE_OPTIONS={SIZE_OPTIONS}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProduct}
        currentProduct={currentProduct} 
      />
    </>
  );
};

export default ProductDialogs;
