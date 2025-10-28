
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Users, Tag, Filter, Mail, Heart, Calculator, Image, Music } from "lucide-react";
import { products } from "@/data/products";
import ProductManagement from "@/components/admin/product/ProductManagement";
import ClientManagement from "@/components/admin/ClientManagement";
import AdminNotifications from "@/components/admin/AdminNotifications";
import CategoryManagement from "@/components/admin/CategoryManagement";
import FilterManagement from "@/components/admin/FilterManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import LovableManagement from "@/components/admin/LovableManagement";
import IdeasManagement from "@/components/admin/IdeasManagement";
import DepensesManagement from "@/components/admin/DepensesManagement";
import ImageManagement from "@/components/admin/ImageManagement";
import { Idea } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import AirtableManagement from "@/components/admin/AirtableManagement";

const AdminPage = () => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("products");

  // Fetch notification counts
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Count unread messages
      const { count: messagesCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      // Count new users from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday.toISOString());

      // Count new products from the last 24 hours
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      setUnreadMessagesCount(messagesCount || 0);
      setNewUsersCount(usersCount || 0);
      setNewProductsCount(productsCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Reset counters when clicking on the respective tabs
    if (value === 'contacts') {
      setUnreadMessagesCount(0);
    } else if (value === 'clients') {
      setNewUsersCount(0);
    } else if (value === 'products') {
      setNewProductsCount(0);
    }
  };

  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminNotifications />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2 relative">
            <Package className="h-4 w-4" />
            Produits
            {newProductsCount > 0 && (
              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                {newProductsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2 relative">
            <Mail className="h-4 w-4" />
            Messages
            {unreadMessagesCount > 0 && (
              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                {unreadMessagesCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="lovable" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Lovable
          </TabsTrigger>
          <TabsTrigger value="moni" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Moni
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 relative">
            <Users className="h-4 w-4" />
            Users
            {newUsersCount > 0 && (
              <Badge variant="destructive" className="ml-1 min-w-[20px] h-5 px-1.5 py-0 text-xs">
                {newUsersCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="idees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Idées
          </TabsTrigger>
          <TabsTrigger value="artistes" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Artistes
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
        
        <TabsContent value="moni">
          <DepensesManagement />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="images">
          <ImageManagement />
        </TabsContent>

         <TabsContent value="idees">
          <IdeasManagement initialIdeas={[]} />
        </TabsContent>

         <TabsContent value="artistes">
          <AirtableManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
