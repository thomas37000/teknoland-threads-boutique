import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="group cursor-pointer bg-card rounded-lg overflow-hidden border">
      <div className="relative">
        <Skeleton className="w-full h-64" />
        <Skeleton className="absolute top-4 right-4 w-8 h-8 rounded-full" />
      </div>
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;