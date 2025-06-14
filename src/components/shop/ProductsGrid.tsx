
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

interface ProductsGridProps {
  displayedProducts: Product[];
  hasMoreProducts: boolean;
  onLoadMore: () => void;
}

const ProductsGrid = ({ displayedProducts, hasMoreProducts, onLoadMore }: ProductsGridProps) => {
  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
        <p className="text-tekno-gray">
          Essayez de modifier vos filtres ou revenez plus tard pour de nouveaux articles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {hasMoreProducts && (
        <div className="mt-10 text-center">
          <Button 
            onClick={onLoadMore} 
            className="bg-tekno-black hover:bg-tekno-blue text-white"
          >
            Charger plus de produits
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductsGrid;
