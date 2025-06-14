
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { createCartCheckoutSession } from "@/utils/cart-checkout";
import { toast } from "sonner";
import { useState } from "react";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmptyState from "@/components/cart/CartEmptyState";
import CartHeader from "@/components/cart/CartHeader";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal
  } = useCart();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // When user delete product and cart is === 0
  if (cartItems.length === 0) {
    return <CartEmptyState />;
  }

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const { url } = await createCartCheckoutSession(cartItems);
      // Open Stripe checkout in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors du traitement du paiement. Veuillez réessayer.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white border rounded-lg overflow-hidden">
            <CartHeader />

            {cartItems.map((item) => (
              <CartItem
                key={`${item.product.id}-${item.size}-${item.color}`}
                item={item}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="mt-6">
            <Link to="/shop">
              <Button variant="outline" className="hover:bg-tekno-black hover:text-white">
                Continuez le Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <CartSummary
          subtotal={subtotal}
          onCheckout={handleCheckout}
          isProcessingPayment={isProcessingPayment}
        />
      </div>
    </div>
  );
};

export default CartPage;
