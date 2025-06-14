
import React from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createCheckoutSession } from "@/utils/cart-checkout";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmptyState from "@/components/cart/CartEmptyState";
import CartHeader from "@/components/cart/CartHeader";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    try {
      await createCheckoutSession(items);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <a href="/shop" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au shop
              </a>
            </Button>
          </div>
          <CartEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <a href="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au shop
            </a>
          </Button>
        </div>

        <CartHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={`${item.id}-${item.size || 'default'}-${item.color || 'default'}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemoveFromCart={removeFromCart}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              totalPrice={getTotalPrice()}
              onCheckout={handleCheckout}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
