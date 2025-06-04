
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTab from './tabs/AccountTab';
import FavoritesTab from './tabs/FavoritesTab';
import CartTab from './tabs/CartTab';
import OrdersTab from './tabs/OrdersTab';

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

interface ProfileTabsProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orders: Order[];
  ordersLoading: boolean;
}

const ProfileTabs = ({ user, activeTab, setActiveTab, orders, ordersLoading }: ProfileTabsProps) => {
  return (
    <main className="w-full md:w-2/3 lg:w-3/4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="favorites">Favorits</TabsTrigger>
          <TabsTrigger value="cart">Panier</TabsTrigger>
          <TabsTrigger value="orders">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountTab user={user} />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <FavoritesTab />
        </TabsContent>

        <TabsContent value="cart" className="mt-6">
          <CartTab />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersTab orders={orders} ordersLoading={ordersLoading} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ProfileTabs;
