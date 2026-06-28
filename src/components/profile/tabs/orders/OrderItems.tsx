
import React from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  item_name?: string | null;
  item_image?: string | null;
  item_type?: string | null;
  external_ref?: string | null;
  products?: {
    id: string;
    name: string;
  } | null;
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems = ({ items }: OrderItemsProps) => {
  return (
    <div>
      {items.map((item, index) => {
        const name = item.item_name || item.products?.name || "Article";
        return (
          <div key={item.id} className="text-sm">
            {name}
            {item.item_type === "vinyle" && " 🎵"}
            {item.size && ` (${item.size})`}
            {item.color && ` - ${item.color}`}
            {` x${item.quantity}`}
            {index < items.length - 1 && <br />}
          </div>
        );
      })}
    </div>
  );
};

export default OrderItems;
