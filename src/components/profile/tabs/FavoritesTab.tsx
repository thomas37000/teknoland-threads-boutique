
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import ProductCard from "@/components/ProductCard";

const FavoritesTab = () => {
  const { favorites } = useFavorites();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="mr-2" /> Vos Favorits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium">Pas de favorits encore</h3>
            <p className="text-gray-500">Les produits sélectionnés apparaitrons ici.</p>
            <Button className="mt-4" variant="outline" asChild>
              <a href="/shop">Voir les produits</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoritesTab;
