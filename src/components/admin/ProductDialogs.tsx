
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const CATEGORIES = ["Man's T-shirts", "Sweats", "Vinyle"];
const SIZE_OPTIONS = ["S", "M", "L", "XL"];

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

interface SizeStock {
  size: string;
  stock: number;
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
  const [sizeStocks, setSizeStocks] = useState<{[size: string]: number}>({
    'S': 0,
    'M': 0,
    'L': 0,
    'XL': 0
  });
  const [editSizeStocks, setEditSizeStocks] = useState<{[size: string]: number}>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string>("");
  
  // Setup initial edit size stocks when a product is loaded
  useEffect(() => {
    if (currentProduct && currentProduct.size_stocks) {
      // Initialize from existing size_stocks
      setEditSizeStocks(currentProduct.size_stocks as {[size: string]: number} || {});
      setSelectedSizes(currentProduct.sizes || []);
      setSelectedColors(currentProduct.colors?.join(', ') || '');
    } else if (currentProduct) {
      // Fallback to initialize from available sizes
      const stocks: {[size: string]: number} = {};
      (currentProduct.sizes || []).forEach(size => {
        stocks[size] = currentProduct.stock || 0;
      });
      setEditSizeStocks(stocks);
      setSelectedSizes(currentProduct.sizes || []);
      setSelectedColors(currentProduct.colors?.join(', ') || '');
    } else {
      setEditSizeStocks({});
      setSelectedSizes([]);
      setSelectedColors('');
    }
  }, [currentProduct]);

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

  // Handle size selection for new product
  const handleSizeChange = (size: string) => {
    const newSelectedSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    
    setSelectedSizes(newSelectedSizes);
    
    // Update newProduct sizes
    setNewProduct({
      ...newProduct,
      sizes: newSelectedSizes
    });
  };

  // Handle stock change for a specific size
  const handleSizeStockChange = (size: string, value: string, isEdit: boolean) => {
    const stock = parseInt(value) || 0;
    
    if (isEdit) {
      setEditSizeStocks({
        ...editSizeStocks,
        [size]: stock
      });
    } else {
      setSizeStocks({
        ...sizeStocks,
        [size]: stock
      });
      
      // Update newProduct size_stocks
      setNewProduct({
        ...newProduct,
        size_stocks: {
          ...sizeStocks,
          [size]: stock
        }
      });
    }
  };

  // Handle add product with image upload
  const handleAddWithImage = async () => {
    try {
      // Calculate total stock from size stocks
      const totalStock = Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
      const colors = selectedColors.split(',').map(c => c.trim()).filter(c => c !== '');
      
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
          sizes: selectedSizes,
          colors: colors,
          size_stocks: sizeStocks,
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
      setSizeStocks({
        'S': 0,
        'M': 0,
        'L': 0,
        'XL': 0
      });
      setSelectedSizes([]);
      setSelectedColors('');
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
      // Calculate total stock from size stocks
      const totalStock = Object.values(editSizeStocks).reduce((sum, stock) => sum + stock, 0);
      const colors = selectedColors.split(',').map(c => c.trim()).filter(c => c !== '');
      
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
          image: imageUrl,
          images: additionalImages.length > 0 ? additionalImages : null,
          category: currentProduct.category,
          stock: totalStock,
          sizes: selectedSizes,
          colors: colors,
          size_stocks: editSizeStocks
        })
        .eq('id', currentProduct.id)
        .select();
      
      if (updateError) {
        throw updateError;
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            
            {/* Sizes with Stock Quantity */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Sizes & Stock
              </Label>
              <div className="col-span-3 space-y-3">
                {SIZE_OPTIONS.map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => handleSizeChange(size)}
                    />
                    <Label htmlFor={`size-${size}`} className="flex-1">{size}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeStocks[size] || 0}
                      onChange={(e) => handleSizeStockChange(size, e.target.value, false)}
                      className="w-24"
                      disabled={!selectedSizes.includes(size)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Colors */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colors" className="text-right">
                Colors
              </Label>
              <Input
                id="colors"
                placeholder="Enter colors separated by commas"
                value={selectedColors}
                onChange={(e) => setSelectedColors(e.target.value)}
                className="col-span-3"
              />
            </div>
            
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWithImage}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            
            {/* Sizes with Stock Quantity */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Sizes & Stock
              </Label>
              <div className="col-span-3 space-y-3">
                {SIZE_OPTIONS.map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <Checkbox
                      id={`edit-size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => {
                        const newSizes = selectedSizes.includes(size)
                          ? selectedSizes.filter(s => s !== size)
                          : [...selectedSizes, size];
                        
                        setSelectedSizes(newSizes);
                        
                        if (currentProduct) {
                          setCurrentProduct({
                            ...currentProduct,
                            sizes: newSizes
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-size-${size}`} className="flex-1">{size}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editSizeStocks[size] || 0}
                      onChange={(e) => {
                        const stock = parseInt(e.target.value) || 0;
                        const newStocks = {
                          ...editSizeStocks,
                          [size]: stock
                        };
                        
                        setEditSizeStocks(newStocks);
                        
                        if (currentProduct) {
                          setCurrentProduct({
                            ...currentProduct,
                            size_stocks: newStocks
                          });
                        }
                      }}
                      className="w-24"
                      disabled={!selectedSizes.includes(size)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Colors */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-colors" className="text-right">
                Colors
              </Label>
              <Input
                id="edit-colors"
                placeholder="Enter colors separated by commas"
                value={selectedColors}
                onChange={(e) => {
                  setSelectedColors(e.target.value);
                  
                  if (currentProduct) {
                    setCurrentProduct({
                      ...currentProduct,
                      colors: e.target.value.split(',').map(c => c.trim()).filter(c => c !== '')
                    });
                  }
                }}
                className="col-span-3"
              />
            </div>
            
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditWithImage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{currentProduct?.name}"? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDialogs;
