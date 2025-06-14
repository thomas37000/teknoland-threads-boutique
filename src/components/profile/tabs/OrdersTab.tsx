
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import OrdersTable from './orders/OrdersTable';
import OrdersEmptyState from './orders/OrdersEmptyState';
import OrdersLoadingState from './orders/OrdersLoadingState';

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
          <OrdersLoadingState />
        ) : orders.length > 0 ? (
          <OrdersTable orders={orders} />
        ) : (
          <OrdersEmptyState />
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
