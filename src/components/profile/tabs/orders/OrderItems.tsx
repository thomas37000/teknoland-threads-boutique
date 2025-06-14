
import React from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  products: {
    id: string;
    name: string;
  };
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems = ({ items }: OrderItemsProps) => {
  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="text-sm">
          {item.products.name}
          {item.size && ` (${item.size})`}
          {item.color && ` - ${item.color}`}
          {` x${item.quantity}`}
          {index < items.length - 1 && <br />}
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
