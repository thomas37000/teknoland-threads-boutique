
import React from 'react';
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const OrdersEmptyState = () => {
  return (
    <div className="text-center py-8">
      <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
      <h3 className="text-lg font-medium">Aucun achat</h3>
      <p className="text-gray-500">Votre historique d'achats sera affiché ici.</p>
      <Button className="mt-4" variant="outline" asChild>
        <a href="/shop">Voir les produits</a>
      </Button>
    </div>
  );
};

export default OrdersEmptyState;
