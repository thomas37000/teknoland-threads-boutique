
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  totalPrice: number;
  onCheckout: () => void;
  onClearCart: () => void;
}

const CartSummary = ({ totalPrice, onCheckout, onClearCart }: CartSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sous-total</span>
          <span className="font-medium">{totalPrice.toFixed(2)}€</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Livraison</span>
          <span className="font-medium">Gratuite</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>{totalPrice.toFixed(2)}€</span>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={onCheckout}
            className="w-full bg-tekno-blue hover:bg-tekno-blue/90"
            disabled={totalPrice === 0}
          >
            Procéder au paiement
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClearCart}
            className="w-full"
            disabled={totalPrice === 0}
          >
            Vider le panier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
