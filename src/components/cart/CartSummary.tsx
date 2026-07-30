
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface CartSummaryProps {
  totalPrice: number;
  onCheckout: () => void;
  onClearCart: () => void;
  onReserve?: () => void;
}

const CartSummary = ({ totalPrice, onCheckout, onClearCart, onReserve }: CartSummaryProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        {/* Résumé de la commande && Order summary */}
        <CardTitle>{t("cart.summary")}</CardTitle>
      </CardHeader>
        <CardContent className="space-y-4">
          {/* Sous-total && Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t("cart.subtotal")}</span>
          <span className="font-medium">{totalPrice.toFixed(2)}€</span>
        </div>
        {/* Livraison && Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t("cart.shipping")}</span>
          <span className="font-medium">{t("cart.shippingFree")}</span>
        </div>
        
        <Separator />
        
        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>{t("cart.total")}</span>
          <span>{totalPrice.toFixed(2)}€</span>
        </div>
        
        <div className="space-y-2">
           {/* Réserver la commande && Order reserve */}
          {onReserve && (
            <Button 
              onClick={onReserve}
              className="w-full bg-tekno-green hover:bg-tekno-green/90"
              disabled={totalPrice === 0}
            >
              {t("cart.reserve")}
            </Button>
          )}

          {/* Finnaliser la commande && Order summary */}
          <Button 
            onClick={onCheckout}
            className="w-full bg-tekno-blue hover:bg-tekno-blue/90"
            disabled={totalPrice === 0}
          >
            {t("cart.checkout")}
          </Button>
          
          {/* Vider le panier && Clear cart */}
          <Button 
            variant="outline" 
            onClick={onClearCart}
            className="w-full"
            disabled={totalPrice === 0}
          >
            {t("cart.clear")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
