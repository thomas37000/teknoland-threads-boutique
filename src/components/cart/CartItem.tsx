
import { Link } from "react-router-dom";
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  return (
    <div key={`${item.product.id}-${item.size}-${item.color}`} className="grid sm:grid-cols-12 gap-4 p-4 border-b last:border-b-0">
      {/* Mobile Product View */}
      <div className="sm:hidden flex items-center justify-between mb-4">
        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => onRemove(item.product.id)}
          className="text-tekno-gray hover:text-tekno-black transition-colors"
          aria-label="Remove item"
        >
          &times;
        </button>
      </div>

      {/* Product */}
      <div className="sm:col-span-6 flex items-center gap-4">
        <div className="hidden sm:block w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <Link to={`/product/${item.product.id}`} className="block overflow-hidden rounded-md">
            <h4 className="font-medium hover:underline">{item.product.name}</h4>
          </Link>
          <div className="text-tekno-gray text-sm mt-1">
            {item.size && <span className="mr-2">Taille: {item.size}</span>}
            {item.color && <span>Couleur: {item.color}</span>}
          </div>

          <button
            onClick={() => onRemove(item.product.id)}
            className="text-tekno-blue hover:underline text-sm mt-2 hidden sm:inline-block"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="sm:col-span-2 flex items-center sm:justify-center">
        <div className="sm:hidden font-medium mr-2">Price:</div>
        <div>{item.product.price.toFixed(2)} €</div>
      </div>

      {/* Quantity */}
      <div className="sm:col-span-2 flex items-center sm:justify-center">
        <div className="sm:hidden font-medium mr-2">Quantity:</div>
        <div className="flex items-center border rounded-md">
          <button
            className="px-2 py-1"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <div className="px-2 py-1">{item.quantity}</div>
          <button
            className="px-2 py-1"
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="sm:col-span-2 flex items-center sm:justify-end">
        <div className="sm:hidden font-medium mr-2">Total:</div>
        <div className="font-medium">
          {(item.product.price * item.quantity).toFixed(2)} €
        </div>
      </div>
    </div>
  );
};

export default CartItem;
