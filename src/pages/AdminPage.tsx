
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Tag, Filter, Mail, Heart } from "lucide-react";
import { products } from "@/data/products";
import ProductManagement from "@/components/admin/ProductManagement";
import ClientManagement from "@/components/admin/ClientManagement";
import AdminNotifications from "@/components/admin/AdminNotifications";
import CategoryManagement from "@/components/admin/CategoryManagement";
import FilterManagement from "@/components/admin/FilterManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import LovableManagement from "@/components/admin/LovableManagement";
import IdeasTable from "@/components/admin/IdeasTable";
import { Ideas } from "@/types";

const AdminPage = () => {
  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminNotifications />
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="lovable" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Lovable
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="idees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Idées
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
        
        <TabsContent value="contacts">
          <ContactManagement />
        </TabsContent>
        
        <TabsContent value="lovable">
          <LovableManagement />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

         <TabsContent value="idees">
          <IdeasTable ideas={[]} openEditDialog={function (idea: Ideas): void {
            throw new Error("Function not implemented.");
          } } openDeleteDialog={function (idea: Ideas): void {
            throw new Error("Function not implemented.");
          } } currentPage={0} totalPages={0} onPageChange={function (page: number): void {
            throw new Error("Function not implemented.");
          } } />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
