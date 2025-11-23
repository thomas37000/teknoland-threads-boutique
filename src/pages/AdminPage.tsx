
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import AirtableManagement from "@/components/admin/AirtableManagement";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <SidebarProvider>
      <div className="flex w-full">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          newProductsCount={newProductsCount}
          unreadMessagesCount={unreadMessagesCount}
          newUsersCount={newUsersCount}
        />

        <main className="flex-1 overflow-auto">
          <div className="tekno-container py-12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <SidebarTrigger />
            </div>
            <AdminNotifications />

            {activeTab === "products" && <ProductManagement initialProducts={products} />}
            {activeTab === "categories" && <CategoryManagement />}
            {activeTab === "filters" && <FilterManagement />}
            {activeTab === "contacts" && <ContactManagement />}
            {activeTab === "lovable" && <LovableManagement />}
            {activeTab === "moni" && <DepensesManagement />}
            {activeTab === "clients" && <ClientManagement />}
            {activeTab === "images" && <ImageManagement />}
            {activeTab === "idees" && <IdeasManagement initialIdeas={[]} />}
            {activeTab === "artistes" && <AirtableManagement />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
