
import React, { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createCheckoutSession } from "@/utils/cart-checkout";
import { supabase } from "@/integrations/supabase/client";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmptyState from "@/components/cart/CartEmptyState";
import CartHeader from "@/components/cart/CartHeader";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Lien retour : si le panier contient des vinyles distributeur, on renvoie
  // vers /distribution plutôt que vers la boutique grand public.
  const hasVinyles = items.some((i) => i.itemType === "vinyle");
  const backHref = hasVinyles ? "/distribution" : "/shop";
  const backLabel = hasVinyles ? "Distribution" : t("nav.shop");

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const vinyles = items.filter((i) => i.itemType === "vinyle");
      const others = items.filter((i) => i.itemType !== "vinyle");
      if (vinyles.length > 0 && others.length > 0) {
        // Stripe ne peut pas mixer une commande vinyles distributeur et une
        // commande produits standard (logiques de stock & RBAC différentes).
        throw new Error(
          "Veuillez régler séparément les vinyles distributeur et les autres produits.",
        );
      }
      if (vinyles.length > 0) {
        const { data, error } = await supabase.functions.invoke("create-vinyle-checkout", {
          body: {
            items: vinyles.map((v) => ({
              recordId: v.externalRef,
              quantity: v.quantity,
            })),
          },
        });
        if (error) throw error;
        if (data?.error)
          throw new Error(typeof data.error === "string" ? data.error : "Erreur paiement");
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("URL de paiement manquante");
        }
      } else {
        await createCheckoutSession(items);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/auth");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <a href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
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
            <a href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
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

        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("cart.loginRequired")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("cart.loginRequiredDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cart.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLoginRedirect}>
                {t("cart.goToLogin")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CartPage;
