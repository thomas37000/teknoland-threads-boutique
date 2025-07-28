import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users } from "lucide-react";
import SellerProductManagement from "@/components/admin/SellerProductManagement";
import SellerClientManagement from "@/components/admin/SellerClientManagement";

const SellerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interface Vendeur</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos produits et suivez vos clients
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={16} />
              Mes Produits
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users size={16} />
              Mes Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <SellerProductManagement />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <SellerClientManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerPage;