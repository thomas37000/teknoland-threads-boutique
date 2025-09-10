
import React, { useState, useEffect } from "react";
import PopupAdmin from "./PopupAdmin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { X, Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Man's T-shirts", "Sweats", "Vinyles", "Stickers"];
const SIZE_OPTIONS = ["S", "M", "L", "XL"];
const COLOR_OPTIONS = ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose", "Violet", "Orange", "Gris"];

interface ProductVariation {
  color: string;
  size: string;
  stock: number;
  image?: string; // URL de l'image pour cette variation
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

  const categorySelected = newProduct?.category;
  const showVariations = categorySelected && !["Vinyles", "Stickers"].includes(categorySelected)

  // Setup initial variations when a product is loaded
  useEffect(() => {
    if (currentProduct) {
      // Try to convert from current format to variations
      const existingVariations: ProductVariation[] = [];
      
      if (currentProduct.size_stocks) {
        const sizeStocksData = currentProduct.size_stocks as any;
        
        // Check if the new format with variations exists
        if (sizeStocksData.variations && Array.isArray(sizeStocksData.variations)) {
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
      }
    } else {
      setEditVariations([]);
    }
  }, [currentProduct]);

  // Reset variations when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      setVariations([]);
    }
  }, [isAddDialogOpen]);

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
      image: isEdit ? currentProduct?.image : '' // Initialize with main image
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

  // Handle add product with image upload
  const handleAddWithImage = async () => {
    try {
      const categoriesWithoutVariations = ["Vinyles", "Stickers"];
      const needsVariations = !categoriesWithoutVariations.includes(newProduct.category || '');
      
      if (needsVariations && variations.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one variation (color/size/stock).",
          variant: "destructive"
        });
        return;
      }

      // Calculate total stock from variations
      const totalStock = needsVariations 
        ? variations.reduce((sum, variation) => sum + variation.stock, 0)
        : Number(newProduct.stock) || 0;
      const uniqueColors = needsVariations ? [...new Set(variations.map(v => v.color))] : [];
      const uniqueSizes = needsVariations ? [...new Set(variations.map(v => v.size))] : [];
      
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
      const sizeStocks: {[size: string]: number} = {};
      if (needsVariations) {
        variations.forEach(variation => {
          sizeStocks[variation.size] = (sizeStocks[variation.size] || 0) + variation.stock;
        });
      }

      const sizeStocksToSave = needsVariations
        ? JSON.parse(JSON.stringify({ variations, sizeStocks }))
        : {};

      // Insert the product into the Supabase database
      const { data: productData, error: insertError } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name || '',
          description: newProduct.description || '',
          price: Number(newProduct.price) || 0,
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
      setImageFile(null);
      setMultipleImageFiles([]);
      setVariations([]);
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
     const categoriesWithoutVariations = ["Vinyles", "Stickers"];

     // Vérifie si la catégorie nécessite des variations
     const needsVariations = !categoriesWithoutVariations.includes(currentProduct.category);
      if ( needsVariations && editVariations.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one variation (color/size/stock).",
          variant: "destructive"
        });
        return;
      }

      // Calculate total stock from variations
      // Calcul du stock total et des couleurs/sizes uniques
    const totalStock = needsVariations
      ? editVariations.reduce((sum, variation) => sum + variation.stock, 0)
      : Number(currentProduct.stock) || 0;

    const uniqueColors = needsVariations
      ? [...new Set(editVariations.map(v => v.color))]
      : [];
    const uniqueSizes = needsVariations
      ? [...new Set(editVariations.map(v => v.size))]
      : [];

    // Préparer size_stocks
    const sizeStocksToSave = needsVariations
      ? JSON.parse(JSON.stringify({ variations: editVariations, sizeStocks: editVariations.reduce((acc, v) => ({ ...acc, [`${v.color}-${v.size}`]: v.stock }), {}) }))
      : {};
      
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

      // Create size_stocks object for backward compatibility
      const sizeStocks: {[size: string]: number} = {};
      editVariations.forEach(variation => {
        sizeStocks[variation.size] = (sizeStocks[variation.size] || 0) + variation.stock;
      });
      
      // Update the product in the Supabase database
      const { data: updatedData, error: updateError } = await supabase
        .from('products')
        .update({
          name: currentProduct.name,
          description: currentProduct.description,
          price: Number(currentProduct.price),
          image: imageUrl,
          images: additionalImages.length > 0 ? additionalImages : null,
          category: currentProduct.category,
          stock: totalStock,
          sizes: uniqueSizes,
          colors: uniqueColors,
          size_stocks: JSON.parse(JSON.stringify({ variations: editVariations, sizeStocks }))
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
      {/* Add Product Dialog */}
      <PopupAdmin
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Product"
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newProduct.name || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select
                value={newProduct.category || ""}
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={newProduct.price || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          
          {/* Main Image Upload */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Main Image
            </Label>
            <div className="col-span-3">
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(e, false)}
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, or WebP. Max 10MB.
              </p>
            </div>
          </div>
          
          {/* Additional Images Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="additional-images" className="text-right">
              Additional Images
            </Label>
            <div className="col-span-3">
              <Input
                id="additional-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleMultipleImageChange(e, false)}
                className="col-span-3"
                disabled={multipleImageFiles.length >= 4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload up to 4 additional images. JPG, PNG, or WebP. Max 10MB each.
              </p>
              
              {multipleImageFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {multipleImageFiles.map((file, index) => (
                    <div key={index} className="relative border rounded p-2">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`}
                        className="h-20 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Variations */}
          { !["Vinyles", "Stickers"].includes(newProduct?.category) && (
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Variations
            </Label>
            <div className="col-span-3 space-y-4">
              {variations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variation {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                   <div className="grid grid-cols-4 gap-3">
                     <div>
                       <Label className="text-sm">Image</Label>
                       <div className="space-y-2">
                         <Select
                           value={variation.image || ''}
                           onValueChange={(value) => updateVariation(index, 'image', value)}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Choisir image" />
                           </SelectTrigger>
                           <SelectContent>
                             {imageFile && (
                               <SelectItem value={URL.createObjectURL(imageFile)}>
                                 Image principale
                               </SelectItem>
                             )}
                             {multipleImageFiles.map((file, imgIndex) => (
                               <SelectItem key={imgIndex} value={URL.createObjectURL(file)}>
                                 Image {imgIndex + 1}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         {variation.image && (
                           <img 
                             src={variation.image} 
                             alt={`Variation ${index + 1}`}
                             className="w-12 h-12 object-cover rounded border"
                           />
                         )}
                       </div>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Couleur</Label>
                       <Select
                         value={variation.color}
                         onValueChange={(value) => updateVariation(index, 'color', value)}
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {COLOR_OPTIONS.map(color => (
                             <SelectItem key={color} value={color}>{color}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Taille</Label>
                       <Select
                         value={variation.size}
                         onValueChange={(value) => updateVariation(index, 'size', value)}
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {SIZE_OPTIONS.map(size => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Stock</Label>
                       <Input
                         type="number"
                         min="0"
                         value={variation.stock}
                         onChange={(e) => updateVariation(index, 'stock', e.target.value)}
                       />
                     </div>
                   </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => addVariation()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variation
              </Button>
              
              {variations.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Stock total: {variations.reduce((sum, v) => sum + v.stock, 0)} unités
                </div>
              )}
            </div>
          </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={newProduct.description || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAddWithImage} className="flex-1">Add Product</Button>
        </div>
      </PopupAdmin>

      {/* Edit Product Dialog */}
      <PopupAdmin
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Product"
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={currentProduct?.name || ""}
              onChange={(e) =>
                setCurrentProduct(
                  currentProduct
                    ? { ...currentProduct, name: e.target.value }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select
                value={currentProduct?.category || ""}
                onValueChange={(value) =>
                  setCurrentProduct(
                    currentProduct
                      ? { ...currentProduct, category: value }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Price
            </Label>
            <Input
              id="edit-price"
              type="number"
              value={currentProduct?.price || ""}
              onChange={(e) =>
                setCurrentProduct(
                  currentProduct
                    ? { ...currentProduct, price: parseFloat(e.target.value) }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
          
          {/* Main Image Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-image" className="text-right">
              Main Image
            </Label>
            <div className="col-span-3 space-y-2">
              {currentProduct?.image && (
                <div className="mb-2">
                  <img 
                    src={currentProduct.image} 
                    alt={currentProduct.name} 
                    className="h-20 w-auto object-contain rounded"
                  />
                </div>
              )}
              <Input
                id="edit-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageChange(e, true)}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP. Max 10MB.
              </p>
              <div className="text-xs text-muted-foreground">
                Site pour comprésser vos fichiers si suppérier à 10MB: https://compresspng.com/fr/
              </div>
            </div>
          </div>
          
          {/* Additional Images Upload */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-additional-images" className="text-right">
              Additional Images
            </Label>
            <div className="col-span-3">
              {/* Show existing additional images */}
              {currentProduct?.images && currentProduct.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {currentProduct.images.map((img, index) => (
                    <div key={index} className="relative border rounded p-2">
                      <img 
                        src={img} 
                        alt={`Image ${index}`}
                        className="h-20 w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <Input
                id="edit-additional-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleMultipleImageChange(e, true)}
                className="col-span-3"
                disabled={editMultipleImageFiles.length >= 4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload up to 4 new additional images. Will replace existing images. JPG, PNG, or WebP. Max 10MB each.
              </p>
              
              {editMultipleImageFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {editMultipleImageFiles.map((file, index) => (
                    <div key={index} className="relative border rounded p-2">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`}
                        className="h-20 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Variations */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Variations
            </Label>
            <div className="col-span-3 space-y-4">
              {editVariations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variation {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariation(index, true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                   <div className="grid grid-cols-4 gap-3">
                     <div>
                       <Label className="text-sm">Image</Label>
                       <div className="space-y-2">
                         <Select
                           value={variation.image || ''}
                           onValueChange={(value) => updateVariation(index, 'image', value, true)}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Choisir image" />
                           </SelectTrigger>
                           <SelectContent>
                             {currentProduct?.image && (
                               <SelectItem value={currentProduct.image}>
                                 Image principale
                               </SelectItem>
                             )}
                             {editImageFile && (
                               <SelectItem value={URL.createObjectURL(editImageFile)}>
                                 Nouvelle image principale
                               </SelectItem>
                             )}
                             {currentProduct?.images?.map((img, imgIndex) => (
                               <SelectItem key={imgIndex} value={img}>
                                 Image {imgIndex + 1}
                               </SelectItem>
                             ))}
                             {editMultipleImageFiles.map((file, imgIndex) => (
                               <SelectItem key={`new-${imgIndex}`} value={URL.createObjectURL(file)}>
                                 Nouvelle image {imgIndex + 1}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         {variation.image && (
                           <img 
                             src={variation.image} 
                             alt={`Variation ${index + 1}`}
                             className="w-12 h-12 object-cover rounded border"
                           />
                         )}
                       </div>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Couleur</Label>
                       <Select
                         value={variation.color}
                         onValueChange={(value) => updateVariation(index, 'color', value, true)}
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {COLOR_OPTIONS.map(color => (
                             <SelectItem key={color} value={color}>{color}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Taille</Label>
                       <Select
                         value={variation.size}
                         onValueChange={(value) => updateVariation(index, 'size', value, true)}
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {SIZE_OPTIONS.map(size => (
                             <SelectItem key={size} value={size}>{size}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div>
                       <Label className="text-sm">Stock</Label>
                       <Input
                         type="number"
                         min="0"
                         value={variation.stock}
                         onChange={(e) => updateVariation(index, 'stock', e.target.value, true)}
                       />
                     </div>
                   </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => addVariation(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variation
              </Button>
              
              {editVariations.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Stock total: {editVariations.reduce((sum, v) => sum + v.stock, 0)} unités
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Input
              id="edit-description"
              value={currentProduct?.description || ""}
              onChange={(e) =>
                setCurrentProduct(
                  currentProduct
                    ? { ...currentProduct, description: e.target.value }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleEditWithImage} className="flex-1">Save Changes</Button>
        </div>
      </PopupAdmin>

      {/* Delete Product Dialog */}
      <PopupAdmin
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteProduct} className="flex-1">
            Delete
          </Button>
        </div>
      </PopupAdmin>
    </>
  );
};

export default ProductDialogs;
