import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { Product } from "@/types";
import { AdminProductTable } from "./AdminProductTable";
import ProductDialogs from "./ProductDialogs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { transformProductsFromDB } from "@/utils/product-transform";

interface ProductManagementProps {
  initialProducts: Product[];
}

const ITEMS_PER_PAGE = 5;
const CATEGORIES = ["Man's T-Shirts","Women's T-Shirts", "Sweats", "Vinyls"];

const ProductManagement = ({ initialProducts }: ProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sellers, setSellers] = useState<any[]>([]);
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
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
    category: CATEGORIES[0],
    stock: 0,
    sizes: [],
    colors: [],
    size_stocks: {}
  });

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, roles')
        .in('roles', ['admin', 'seller']);
      if (!error) setSellers(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const calculateTotalStock = (product: Product): number => {
    // Nouveau format avec variations
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return product.variations.reduce((sum, variation) => sum + (variation.stock || 0), 0);
    }
    // Ancien format avec size_stocks
    if (product.size_stocks && typeof product.size_stocks === 'object') {
      // Gérer le cas où size_stocks contient un objet sizeStocks imbriqué
      const sizeStocks = (product.size_stocks as any).sizeStocks || product.size_stocks;
      if (sizeStocks && typeof sizeStocks === 'object' && Object.keys(sizeStocks).length > 0) {
        return Object.values(sizeStocks as Record<string, number>).reduce((sum: number, stock: number) => sum + (Number(stock) || 0), 0);
      }
    }
    // Fallback sur stock simple
    return product.stock || 0;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const transformedData = transformProductsFromDB(data);
          setProducts(transformedData);
          setFilteredProducts(transformedData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
    fetchSellers();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(product => product.category === categoryFilter);
    }
    if (stockFilter === "low") {
      result = result.filter(product => calculateTotalStock(product) <= 5);
    } else if (stockFilter === "out") {
      result = result.filter(product => calculateTotalStock(product) === 0);
    } else if (stockFilter === "in") {
      result = result.filter(product => calculateTotalStock(product) > 0);
    }
    if (sellerFilter !== "all") {
      result = result.filter(product => product.seller_id === sellerFilter);
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchQuery, categoryFilter, stockFilter, sellerFilter]);

  const handleAddProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const transformedData = transformProductsFromDB(data);
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  const handleEditProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const transformedData = transformProductsFromDB(data);
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error refreshing products after edit:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', currentProduct.id);
      if (error) {
        console.error("Error deleting product:", error);
        toast({ 
          title: "Error", 
          description: `Failed to delete ${currentProduct.name}. ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      setProducts(products.filter((p) => p.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
      toast({ title: "Product deleted", description: `${currentProduct.name} has been deleted successfully.` });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ 
        title: "Error", 
        description: `Failed to delete ${currentProduct.name}. Please try again.`,
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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentItems = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajoutez un produit
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
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
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vendeur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les vendeurs</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.full_name || seller.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading products...</p>
        </div>
      ) : (
        <AdminProductTable 
          products={currentItems} 
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          calculateTotalStock={calculateTotalStock}
          showSeller={true}
          sellers={sellers}
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