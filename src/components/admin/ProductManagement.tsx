
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { Product } from "@/types";
import ProductTable from "./ProductTable";
import ProductDialogs from "./ProductDialogs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductManagementProps {
  initialProducts: Product[];
}

const ITEMS_PER_PAGE = 5;
const CATEGORIES = ["T-shirt", "Sweat", "Vinyle"]; // Available categories

const ProductManagement = ({ initialProducts }: ProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
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
    category: CATEGORIES[0], // Default to first category
    stock: 0,
    sizes: [],
    colors: [],
    size_stocks: {}
  });

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match the Product interface
          const transformedData: Product[] = data.map(item => ({
            ...item,
            size_stocks: item.size_stocks ? (item.size_stocks as any) : {},
            isNew: item.is_new
          }));
          
          setProducts(transformedData);
          setFilteredProducts(transformedData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(lowerQuery) || 
          product.description.toLowerCase().includes(lowerQuery) ||
          product.id.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter === "low") {
      result = result.filter(product => product.stock <= 5);
    } else if (stockFilter === "out") {
      result = result.filter(product => product.stock === 0);
    } else if (stockFilter === "in") {
      result = result.filter(product => product.stock > 0);
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  // Current page items
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddProduct = async () => {
    // The actual adding to Supabase is now handled in ProductDialogs.tsx
    // This function is now just to refresh the product list
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) {
        // Transform the data to match the Product interface
        const transformedData: Product[] = data.map(item => ({
          ...item,
          size_stocks: item.size_stocks ? (item.size_stocks as any) : {},
          isNew: item.is_new
        }));
        
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  const handleEditProduct = async () => {
    // The actual updating in Supabase is now handled in ProductDialogs.tsx
    // This function is now just to refresh the product list
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) {
        // Transform the data to match the Product interface
        const transformedData: Product[] = data.map(item => ({
          ...item,
          size_stocks: item.size_stocks ? (item.size_stocks as any) : {},
          isNew: item.is_new
        }));
        
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing products after edit:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    try {
      // Delete the product from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);
        
      if (error) throw error;
      
      // Update local state to remove the product
      setProducts(products.filter((p) => p.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Product deleted",
        description: `${currentProduct.name} has been deleted successfully.`
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper to calculate total stock from size_stocks object
  const calculateTotalStock = (sizeStocks?: {[size: string]: number} | null): number => {
    if (!sizeStocks) return 0;
    return Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="w-40">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-32">
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading products...</p>
        </div>
      ) : (
        <ProductTable 
          products={currentItems} 
          openEditDialog={openEditDialog}
          openDeleteDialog={openDeleteDialog}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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
