
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Package, Settings, FileText, ShoppingCart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";

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
  const { favorites } = useFavorites();
  const { cartItems, subtotal } = useCart();
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
                <Button variant="outline" className={`w-full justify-start ${activeTab === "account" ? "bg-tekno-blue/80 text-white" : ""}`} onClick={() => setActiveTab("account")}>
                  <User className="mr-2 h-4 w-4" /> Informations compte
                </Button>
                <Button variant="outline" className={`w-full justify-start ${activeTab === "favorites" ? "bg-tekno-blue/80 text-white" : ""}`} onClick={() => setActiveTab("favorites")}>
                  <Heart className="mr-2 h-4 w-4" /> Favorits
                </Button>
                <Button variant="outline" className={`w-full justify-start ${activeTab === "cart" ? "bg-tekno-blue/80 text-white" : ""}`} onClick={() => setActiveTab("cart")}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Panier sauvegardé
                </Button>
                <Button variant="outline" className={`w-full justify-start ${activeTab === "orders" ? "bg-tekno-blue/80 text-white" : ""}`} onClick={() => setActiveTab("orders")}>
                  <Package className="mr-2 h-4 w-4" /> Achats
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => supabase.auth.signOut()}
                >
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Compte</TabsTrigger>
              <TabsTrigger value="favorites">Favorits</TabsTrigger>
              <TabsTrigger value="cart">Panier</TabsTrigger>
              <TabsTrigger value="orders">Historique</TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2" /> Informations compte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                      <p>{user?.user_metadata?.full_name || "Not provided"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Compte créé le :</h3>
                      <p>{new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button className="mt-4">Update Informations</Button>
                    <Button className="mt-4 ml-2 bg-red-600 hover:bg-red-500">Supprimez votre compte</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2" /> Vos Favorits
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
                      <h3 className="text-lg font-medium">Pas de favorits encore</h3>
                      <p className="text-gray-500">Les produits sélectionnés apparaitrons ici.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/shop">Voir les produits</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2" /> Votre panier sauvegardé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {cartItems.map((item) => (
                          <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <div className="text-sm text-gray-600">
                                {item.size && <span className="mr-2">Taille: {item.size}</span>}
                                {item.color && <span>Couleur: {item.color}</span>}
                              </div>
                              <div className="text-sm">Quantité: {item.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{(item.product.price * item.quantity).toFixed(2)} €</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total: {subtotal.toFixed(2)} €</span>
                          <Button asChild className="bg-tekno-blue hover:bg-tekno-blue/90">
                            <a href="/cart">Aller au panier</a>
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Les articles restent sauvegardés pendant 24h
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">Votre panier est vide</h3>
                      <p className="text-gray-500">Les articles que vous ajoutez au panier apparaitront ici.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/shop">Voir les produits</a>
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
                    <FileText className="mr-2" /> Historique achats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tekno-blue mx-auto"></div>
                      <p className="mt-2 text-gray-500">Chargement des commandes...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Commande ID</TableHead>
                          <TableHead>Produits</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {order.order_items.map((item, index) => (
                                <div key={item.id} className="text-sm">
                                  {item.products.name} 
                                  {item.size && ` (${item.size})`}
                                  {item.color && ` - ${item.color}`}
                                  {` x${item.quantity}`}
                                  {index < order.order_items.length - 1 && <br />}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>{order.total.toFixed(2)} €</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  order.status === 'completed' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : order.status === 'pending'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }
                              >
                                {order.status === 'completed' ? 'Livré' : 
                                 order.status === 'pending' ? 'En attente' : 
                                 order.status === 'processing' ? 'En cours' : order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">Aucun achat</h3>
                      <p className="text-gray-500">Votre historique d'achats sera affiché ici.</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/shop">Voir les produits</a>
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
