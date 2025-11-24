
import React, { useState, useEffect } from "react";
import { AddProductDialog } from "./AddProductDialog";
import { EditProductDialog } from "./EditProducDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = ["T-shirts", "Sweats", "Vinyles", "Double Vinyles", "Stickers"];
const SIZE_OPTIONS = ["S", "M", "L", "XL"];
const COLOR_OPTIONS = ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose", "Violet", "Orange", "Gris"];

interface ProductVariation {
  color: string;
  size: string;
  stock: number;
  image?: string; // URL de l'image pour cette variation
}

interface VinylTrack {
  id: string;
  name: string;
  duration: string; // Format MM:SS
  artist: string;
  year: string;
}

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [editMultipleImageFiles, setEditMultipleImageFiles] = useState<File[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [editVariations, setEditVariations] = useState<ProductVariation[]>([]);
  const [vinylTracks, setVinylTracks] = useState<VinylTrack[]>([]);
  const [editVinylTracks, setEditVinylTracks] = useState<VinylTrack[]>([]);

  const categorySelected = newProduct?.category;
  const showVariations = categorySelected && !["Vinyles", "Double Vinyles", "Stickers"].includes(categorySelected);
  const showVinylTracks = categorySelected && ["Vinyles", "Double Vinyles"].includes(categorySelected);
  const showSimpleStock = categorySelected && ["Stickers"].includes(categorySelected);

  // Setup initial variations and vinyl tracks when a product is loaded
  useEffect(() => {
    if (currentProduct) {
      // Try to convert from current format to variations
      const existingVariations: ProductVariation[] = [];

      if (currentProduct.size_stocks) {
        const sizeStocksData = currentProduct.size_stocks as any;

        // Check if this is vinyl tracks data
        if (sizeStocksData.vinylTracks && Array.isArray(sizeStocksData.vinylTracks)) {
          setEditVinylTracks(sizeStocksData.vinylTracks);
        } else if (sizeStocksData.variations && Array.isArray(sizeStocksData.variations)) {
          setEditVariations(sizeStocksData.variations);
        } else if (currentProduct.sizes && currentProduct.colors) {
          // Convert from old format
          currentProduct.colors.forEach(color => {
            currentProduct.sizes!.forEach(size => {
              const stock = sizeStocksData[size] || 0;
              existingVariations.push({ color, size, stock });
            });
          });
          setEditVariations(existingVariations);
        }
      } else {
        setEditVariations([]);
        setEditVinylTracks([]);
      }

      // Initialize default vinyl tracks if it's a vinyl category but no tracks exist
      if (["Vinyles", "Double Vinyles"].includes(currentProduct.category)) {
        const sizeStocksData = currentProduct.size_stocks as any;
        if (!sizeStocksData?.vinylTracks) {
          if (currentProduct.category === "Vinyles") {
            const defaultTracks: VinylTrack[] = [
              { id: "A1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "A2", name: "", duration: "0:00", artist: "", year: "" },
              { id: "B1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "B2", name: "", duration: "0:00", artist: "", year: "" },
            ];
            setEditVinylTracks(defaultTracks);
          } else if (currentProduct.category === "Double Vinyles") {
            const defaultTracks: VinylTrack[] = [
              { id: "A1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "A2", name: "", duration: "0:00", artist: "", year: "" },
              { id: "B1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "B2", name: "", duration: "0:00", artist: "", year: "" },
              { id: "C1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "C2", name: "", duration: "0:00", artist: "", year: "" },
              { id: "D1", name: "", duration: "0:00", artist: "", year: "" },
              { id: "D2", name: "", duration: "0:00", artist: "", year: "" },
            ];
            setEditVinylTracks(defaultTracks);
          }
        }
      }
    } else {
      setEditVariations([]);
      setEditVinylTracks([]);
    }
  }, [currentProduct]);

  // Reset variations and vinyl tracks when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      setVariations([]);
      setVinylTracks([]);
    }
  }, [isAddDialogOpen]);

  // Initialize vinyl tracks based on category
  useEffect(() => {
    if (categorySelected === "Vinyles") {
      const defaultTracks: VinylTrack[] = [
        { id: "A1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "A2", name: "", duration: "0:00", artist: "", year: "" },
        { id: "B1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "B2", name: "", duration: "0:00", artist: "", year: "" },
      ];
      setVinylTracks(defaultTracks);
    } else if (categorySelected === "Double Vinyles") {
      const defaultTracks: VinylTrack[] = [
        { id: "A1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "A2", name: "", duration: "0:00", artist: "", year: "" },
        { id: "B1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "B2", name: "", duration: "0:00", artist: "", year: "" },
        { id: "C1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "C2", name: "", duration: "0:00", artist: "", year: "" },
        { id: "D1", name: "", duration: "0:00", artist: "", year: "" },
        { id: "D2", name: "", duration: "0:00", artist: "", year: "" },
      ];
      setVinylTracks(defaultTracks);
    } else {
      setVinylTracks([]);
    }
  }, [categorySelected]);

  // Handle main image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match('image/(jpeg|png|webp)')) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JPG, PNG, or WebP images.",
        variant: "destructive"
      });
      return;
    }

    // Check if file size is less than 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    if (isEdit) {
      setEditImageFile(file);
    } else {
      setImageFile(file);
    }
  };

  // Handle multiple image file selection
  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles: File[] = Array.from(files);

    // Max 4 images
    if (isEdit && editMultipleImageFiles.length + selectedFiles.length > 4) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 4 images.",
        variant: "destructive"
      });
      return;
    } else if (!isEdit && multipleImageFiles.length + selectedFiles.length > 4) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 4 images.",
        variant: "destructive"
      });
      return;
    }

    // Validate each file
    for (const file of selectedFiles) {
      // Check if file is an image
      if (!file.type.match('image/(jpeg|png|webp)')) {
        toast({
          title: "Invalid file type",
          description: "Please upload only JPG, PNG, or WebP images.",
          variant: "destructive"
        });
        return;
      }

      // Check if file size is less than 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload images smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
    }

    if (isEdit) {
      setEditMultipleImageFiles(prev => [...prev, ...selectedFiles].slice(0, 4));
    } else {
      setMultipleImageFiles(prev => [...prev, ...selectedFiles].slice(0, 4));
    }
  };

  // Remove an image from the list
  const removeImage = (index: number, isEdit: boolean) => {
    if (isEdit) {
      setEditMultipleImageFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setMultipleImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Add new variation
  const addVariation = (isEdit: boolean = false) => {
    const newVariation: ProductVariation = {
      color: COLOR_OPTIONS[0],
      size: SIZE_OPTIONS[0],
      stock: 0,
      image: '' // Don't auto-assign image, user must choose
    };

    if (isEdit) {
      setEditVariations([...editVariations, newVariation]);
    } else {
      setVariations([...variations, newVariation]);
    }
  };

  // Remove variation
  const removeVariation = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditVariations(editVariations.filter((_, i) => i !== index));
    } else {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  // Update variation
  const updateVariation = (index: number, field: keyof ProductVariation, value: string | number, isEdit: boolean = false) => {
    const targetVariations = isEdit ? editVariations : variations;
    const setTargetVariations = isEdit ? setEditVariations : setVariations;

    const updatedVariations = [...targetVariations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: field === 'stock' ? parseInt(value as string) || 0 : value
    };

    setTargetVariations(updatedVariations);
  };

  // Update vinyl track
  const updateVinylTrack = (index: number, field: keyof VinylTrack, value: string, isEdit: boolean = false) => {
    const targetTracks = isEdit ? editVinylTracks : vinylTracks;
    const setTargetTracks = isEdit ? setEditVinylTracks : setVinylTracks;

    const updatedTracks = [...targetTracks];
    updatedTracks[index] = {
      ...updatedTracks[index],
      [field]: value
    };

    setTargetTracks(updatedTracks);
  };

  // Handle add product with image upload
  const handleAddWithImage = async () => {
    try {
      const categoriesWithoutVariations = ["Vinyles", "Double Vinyles", "Stickers"];
      const needsVariations = !categoriesWithoutVariations.includes(newProduct.category || '');
      const isVinyl = ["Vinyles", "Double Vinyles"].includes(newProduct.category || '');

      if (needsVariations && variations.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one variation (color/size/stock).",
          variant: "destructive"
        });
        return;
      }

      // Calculate total stock from variations or use simple stock
      let totalStock = 0;
      let uniqueColors: string[] = [];
      let uniqueSizes: string[] = [];

      if (needsVariations) {
        totalStock = variations.reduce((sum, variation) => sum + variation.stock, 0);
        uniqueColors = [...new Set(variations.map(v => v.color))];
        uniqueSizes = [...new Set(variations.map(v => v.size))];
      } else {
        totalStock = Number(newProduct.stock) || 0;
      }

      // Prepare product data for Supabase
      let imageUrl = '';
      let additionalImages: string[] = [];

      // Upload main image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // Upload the image to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Upload additional images if selected
      if (multipleImageFiles.length > 0) {
        for (const file of multipleImageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = fileName;

          // Upload the image to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL of the uploaded image
          const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          additionalImages.push(urlData.publicUrl);
        }
      }

      // Create size_stocks object for backward compatibility
      let sizeStocksToSave = {};

      if (needsVariations) {
        const sizeStocks: { [size: string]: number } = {};
        variations.forEach(variation => {
          sizeStocks[variation.size] = (sizeStocks[variation.size] || 0) + variation.stock;
        });
        sizeStocksToSave = JSON.parse(JSON.stringify({ variations, sizeStocks }));
      } else if (isVinyl) {
        sizeStocksToSave = JSON.parse(JSON.stringify({ 
          vinylTracks,
          streamingUrl: (newProduct as any).streamingUrl || null
        }));
      }

      // Insert the product into the Supabase database
      const { data: productData, error: insertError } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name || '',
          description: newProduct.description || '',
          price: Number(newProduct.price) || 0,
          sold_price: newProduct.sold_price && Number(newProduct.sold_price) > 0 ? Number(newProduct.sold_price) : null,
          image: imageUrl || 'placeholder.png',
          images: additionalImages.length > 0 ? additionalImages : null,
          category: newProduct.category || CATEGORIES[0],
          stock: totalStock,
          sizes: uniqueSizes,
          colors: uniqueColors,
          size_stocks: sizeStocksToSave, // Store both new and old format
          seller_id: (await supabase.auth.getUser()).data.user?.id,
          is_new: true
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Show success message
      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Reset form and close dialog
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: '',
        images: [],
        category: CATEGORIES[0],
        stock: 0,
        sizes: [],
        colors: [],
        size_stocks: {}
      });
      CATEGORIES
      setImageFile(null);
      setMultipleImageFiles([]);
      setVariations([]);
      setVinylTracks([]);
      setIsAddDialogOpen(false);

      // Call the original handler to update UI
      handleAddProduct();

    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle edit product with image upload
  const handleEditWithImage = async () => {
    if (!currentProduct) return;

    try {
      const categoriesWithoutVariations = ["Vinyles", "Double Vinyles", "Stickers"];
      const needsVariations = !categoriesWithoutVariations.includes(currentProduct.category);
      const isVinyl = ["Vinyles", "Double Vinyles"].includes(currentProduct.category);

      if (needsVariations && editVariations.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one variation (color/size/stock).",
          variant: "destructive"
        });
        return;
      }

      // Calculate total stock from variations or use simple stock
      let totalStock = 0;
      let uniqueColors: string[] = [];
      let uniqueSizes: string[] = [];

      if (needsVariations) {
        totalStock = editVariations.reduce((sum, variation) => sum + variation.stock, 0);
        uniqueColors = [...new Set(editVariations.map(v => v.color))];
        uniqueSizes = [...new Set(editVariations.map(v => v.size))];
      } else {
        totalStock = Number(currentProduct.stock) || 0;
      }

      // Prepare size_stocks
      let sizeStocksToSave = {};

      if (needsVariations) {
        const sizeStocks: { [size: string]: number } = {};
        editVariations.forEach(variation => {
          sizeStocks[variation.size] = (sizeStocks[variation.size] || 0) + variation.stock;
        });
        sizeStocksToSave = JSON.parse(JSON.stringify({ variations: editVariations, sizeStocks }));
      } else if (isVinyl) {
        sizeStocksToSave = JSON.parse(JSON.stringify({ 
          vinylTracks: editVinylTracks,
          streamingUrl: currentProduct.size_stocks?.streamingUrl || null
        }));
      }

      // Prepare product data for update
      let imageUrl = currentProduct.image;
      let additionalImages = currentProduct.images || [];

      // Upload new main image if selected
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, editImageFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Upload new additional images if selected
      if (editMultipleImageFiles.length > 0) {
        const newImages: string[] = [];

        for (const file of editMultipleImageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = fileName;

          // Upload the image to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL of the uploaded image
          const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          newImages.push(urlData.publicUrl);
        }

      // Replace existing additional images
      additionalImages = newImages;
    }

      // Update the product in the Supabase database
      const { data: updatedData, error: updateError } = await supabase
        .from('products')
        .update({
          name: currentProduct.name,
          description: currentProduct.description,
          price: Number(currentProduct.price),
          sold_price: currentProduct.sold_price && Number(currentProduct.sold_price) > 0 ? Number(currentProduct.sold_price) : null,
          image: imageUrl,
          images: additionalImages.length > 0 ? additionalImages : null,
          category: currentProduct.category,
          stock: totalStock,
          sizes: uniqueSizes,
          colors: uniqueColors,
          size_stocks: sizeStocksToSave
        })
        .eq('id', currentProduct.id)
        .select();

      if (updateError) {
        console.error("Update error:", updateError);
        toast({
          title: "Error",
          description: `Failed to update product. ${updateError.message}`,
          variant: "destructive"
        });
        return;
      }

      // Show success message
      toast({
        title: "Success",
        description: "Product updated successfully"
      });

      // Reset form and close dialog
      setEditImageFile(null);
      setEditMultipleImageFiles([]);
      setIsEditDialogOpen(false);

      // Call the original handler to update UI
      handleEditProduct();

    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
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
