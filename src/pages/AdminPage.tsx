
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Tag, Filter } from "lucide-react";
import { products } from "@/data/products";
import ProductManagement from "@/components/admin/ProductManagement";
import ClientManagement from "@/components/admin/ClientManagement";
import AdminNotifications from "@/components/admin/AdminNotifications";
import CategoryManagement from "@/components/admin/CategoryManagement";
import FilterManagement from "@/components/admin/FilterManagement";

const AdminPage = () => {
  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminNotifications />
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductManagement initialProducts={products} />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="filters">
          <FilterManagement />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
