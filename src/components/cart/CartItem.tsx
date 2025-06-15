
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { CartItem as CartItemType } from "@/types/cart";
import { useTranslation } from "react-i18next";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemoveFromCart }: CartItemProps) => {
  const { t } = useTranslation();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemoveFromCart(item.id);
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <img
        src={item.image}
        alt={item.name}
        className="h-16 w-16 object-cover rounded-md"
      />
      
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
        <p className="text-gray-600">{item.price}€</p>
        {item.size && (
          <p className="text-sm text-gray-500">{t("cart.size")}: {item.size}</p>
        )}
        {item.color && (
          <p className="text-sm text-gray-500">{t("cart.color")}: {item.color}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 text-center"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-lg font-medium text-gray-900">
        {(item.price * item.quantity).toFixed(2)}€
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700"
        aria-label={t("cart.remove")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItem;
