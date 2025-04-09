
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users } from "lucide-react";
import { products } from "@/data/products";
import ProductManagement from "@/components/admin/ProductManagement";
import ClientManagement from "@/components/admin/ClientManagement";

const AdminPage = () => {
  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductManagement initialProducts={products} />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
