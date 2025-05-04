
import React, { useState } from "react";
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

const CATEGORIES = ["T-shirt", "Sweat", "Vinyle"];
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
  React.useEffect(() => {
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

  // Handle image file selection
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
      
      // Prepare new product with updated fields
      const productToAdd = {
        ...newProduct,
        id: String(Date.now()),
        price: Number(newProduct.price) || 0,
        stock: totalStock,
        category: newProduct.category,
        sizes: selectedSizes,
        colors: selectedColors.split(',').map(c => c.trim()).filter(c => c !== ''),
        size_stocks: sizeStocks
      } as Product;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);
          
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        productToAdd.image = urlData.publicUrl;
      }
      
      // Call the original handler with the updated product
      setNewProduct(productToAdd);
      handleAddProduct();
      
      // Reset form
      setImageFile(null);
      setSizeStocks({
        'S': 0,
        'M': 0,
        'L': 0,
        'XL': 0
      });
      setSelectedSizes([]);
      setSelectedColors('');
      
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
      
      // Prepare updated product
      const updatedProduct = {
        ...currentProduct,
        price: Number(currentProduct.price) || 0,
        stock: totalStock,
        category: currentProduct.category,
        sizes: selectedSizes,
        colors: selectedColors.split(',').map(c => c.trim()).filter(c => c !== ''),
        size_stocks: editSizeStocks
      };

      // Upload new image if selected
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, editImageFile);
          
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        updatedProduct.image = urlData.publicUrl;
      }
      
      // Update the current product and call the original handler
      setCurrentProduct(updatedProduct);
      handleEditProduct();
      
      // Reset form
      setEditImageFile(null);
      
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
            
            {/* Image Upload */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
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
            
            {/* Current Image and Upload New */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Image
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
