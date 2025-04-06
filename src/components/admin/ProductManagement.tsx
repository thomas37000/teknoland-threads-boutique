
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import ProductTable from "./ProductTable";
import ProductDialogs from "./ProductDialogs";
import { toast } from "@/hooks/use-toast";

interface ProductManagementProps {
  initialProducts: Product[];
}

const ProductManagement = ({ initialProducts }: ProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    stock: 0,
  });

  const handleAddProduct = () => {
    const productToAdd = {
      ...newProduct,
      id: String(Date.now()), // Generate a unique ID
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
    } as Product;
    
    setProducts([...products, productToAdd]);
    setNewProduct({
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      stock: 0,
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Product added",
      description: `${productToAdd.name} has been added successfully.`
    });
  };

  const handleEditProduct = () => {
    if (!currentProduct) return;
    
    const updatedProduct = {
      ...currentProduct,
      price: Number(currentProduct.price) || 0,
      stock: Number(currentProduct.stock) || 0,
    };
    
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsEditDialogOpen(false);
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated successfully.`
    });
  };

  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    
    setProducts(products.filter((p) => p.id !== currentProduct.id));
    setIsDeleteDialogOpen(false);
    toast({
      title: "Product deleted",
      description: `${currentProduct.name} has been deleted successfully.`
    });
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2" />
          Add Product
        </Button>
      </div>

      <ProductTable 
        products={products} 
        openEditDialog={openEditDialog}
        openDeleteDialog={openDeleteDialog}
      />

      <ProductDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
        handleAddProduct={handleAddProduct}
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductManagement;
