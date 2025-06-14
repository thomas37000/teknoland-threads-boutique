
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Livré',
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'pending':
        return {
          label: 'En attente',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 'processing':
        return {
          label: 'En cours',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const { label, className } = getStatusConfig(status);

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
