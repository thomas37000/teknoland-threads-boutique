import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductsGridSkeletonProps {
  count?: number;
}

const ProductsGridSkeleton = ({ count = 8 }: ProductsGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductsGridSkeleton;