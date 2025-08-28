import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import ProductTable from "./ProductTable";
import ProductDialogs from "./ProductDialogs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { transformProductsFromDB } from "@/utils/product-transform";

const SellerProductManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    stock: 0,
    seller_id: user?.id
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.roles === 'admin';

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin, filter by seller_id
      if (!isAdmin) {
        query = query.eq('seller_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Erreur lors de la récupération des produits");
      } else {
        // Transform the data to match Product interface
        const transformedData = transformProductsFromDB(data || []);
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la récupération des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (stockFilter && stockFilter !== "all") {
      if (stockFilter === "in-stock") {
        filtered = filtered.filter(product => product.stock > 0);
      } else if (stockFilter === "out-of-stock") {
        filtered = filtered.filter(product => product.stock === 0);
      }
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user?.id);

      if (error) {
        console.error("Error deleting product:", error);
        toast.error("Erreur lors de la suppression du produit");
      } else {
        toast.success("Produit supprimé avec succès");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la suppression du produit");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateTotalStock = (product: Product) => {
    if (product.size_stocks) {
      return Object.values(product.size_stocks).reduce((total, stock) => total + stock, 0);
    }
    return product.stock;
  };

  const handleAddProduct = () => {
    fetchProducts();
  };

  const handleEditProduct = () => {
    fetchProducts();
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Produits</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Ajouter un produit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="man">T-Shirts Hommes</SelectItem>
            <SelectItem value="women">T-Shirts Femmes</SelectItem>
            <SelectItem value="sweats">Sweats</SelectItem>
            <SelectItem value="vinyls">Vinyles</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les stocks</SelectItem>
            <SelectItem value="in-stock">En stock</SelectItem>
            <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ProductTable
        products={currentItems}
        openEditDialog={openEditDialog}
        openDeleteDialog={openDeleteDialog}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ProductDialogs
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        currentProduct={selectedProduct}
        setCurrentProduct={setSelectedProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={() => {}}
      />
    </div>
  );
};

export default SellerProductManagement;