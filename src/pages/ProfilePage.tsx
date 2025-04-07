
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Package, Settings, FileText } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  date: string;
  status: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const { favorites } = useFavorites();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // For demonstration purposes - in a real app, we would fetch actual orders from Supabase
        // Simulating order history since we don't have actual orders yet
        setOrders([
          {
            id: "ord-001",
            name: "Digital Matrix Oxford",
            price: 89.99,
            quantity: 1,
            date: "2025-04-01",
            status: "delivered"
          },
          {
            id: "ord-002",
            name: "Tech Pioneer Denim Jacket",
            price: 129.99,
            quantity: 1,
            date: "2025-03-15",
            status: "processing"
          }
        ]);
      }
      setLoading(false);
    };

    getUser();
  }, []);

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
        {/* Profile Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-tekno-blue text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user?.user_metadata?.full_name || user?.email}</CardTitle>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" /> Account Information
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="mr-2 h-4 w-4" /> Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" /> Orders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => supabase.auth.signOut()}
                >
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2" /> Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p>{user?.user_metadata?.full_name || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                      <p>{new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button className="mt-4">Update Information</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2" /> Your Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">No favorites yet</h3>
                      <p className="text-gray-500">Items you add to favorites will appear here.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/shop">Browse Products</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2" /> Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.name}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>${(order.price * order.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  order.status === 'delivered' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">No orders yet</h3>
                      <p className="text-gray-500">Your purchase history will appear here.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/shop">Start Shopping</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
