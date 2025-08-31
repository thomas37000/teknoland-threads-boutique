
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import ProductsGridSkeleton from "@/components/skeletons/ProductsGridSkeleton";
import { Product } from "@/types";

interface ProductsGridProps {
  displayedProducts: Product[];
  hasMoreProducts: boolean;
  onLoadMore: () => void;
  loading?: boolean;
}

const ProductsGrid = ({ displayedProducts, hasMoreProducts, onLoadMore, loading = false }: ProductsGridProps) => {
  const { t } = useTranslation();
  
  if (loading) {
    return <ProductsGridSkeleton count={8} />;
  }
  
  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">{t('shop.noProducts')}</h3>
        <p className="text-tekno-gray">
          {t('shop.noProductsDesc')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {t('shop.loadMore')}
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductsGrid;
