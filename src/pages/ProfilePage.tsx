
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTabs from "@/components/profile/ProfileTabs";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    size: string | null;
    color: string | null;
    products: {
      id: string;
      name: string;
    };
  }[];
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        await fetchUserOrders(user.id);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const fetchUserOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          order_items (
            id,
            quantity,
            price,
            size,
            color,
            products (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Redirect to home if not logged in
  if (!loading && !user) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="tekno-container py-20 flex justify-center">
        <div className="animate-pulse text-center">
          <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="tekno-container py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <ProfileSidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <ProfileTabs 
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          orders={orders}
          ordersLoading={ordersLoading}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
