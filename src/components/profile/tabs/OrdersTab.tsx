
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Package } from "lucide-react";

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

interface OrdersTabProps {
  orders: Order[];
  ordersLoading: boolean;
}

const OrdersTab = ({ orders, ordersLoading }: OrdersTabProps) => {
  return (
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
  );
};

export default OrdersTab;
