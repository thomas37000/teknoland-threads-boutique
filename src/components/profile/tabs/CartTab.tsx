
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const CartTab = () => {
  const { cartItems, subtotal } = useCart();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2" /> Votre panier sauvegardé
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <div className="text-sm text-gray-600">
                      {item.size && <span className="mr-2">Taille: {item.size}</span>}
                      {item.color && <span>Couleur: {item.color}</span>}
                    </div>
                    <div className="text-sm">Quantité: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(item.product.price * item.quantity).toFixed(2)} €</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total: {subtotal.toFixed(2)} €</span>
                <Button asChild className="bg-tekno-blue hover:bg-tekno-blue/90">
                  <a href="/cart">Aller au panier</a>
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Les articles restent sauvegardés pendant 24h
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium">Votre panier est vide</h3>
            <p className="text-gray-500">Les articles que vous ajoutez au panier apparaitront ici.</p>
            <Button className="mt-4" variant="outline" asChild>
              <a href="/shop">Voir les produits</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartTab;
