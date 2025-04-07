
import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useFavorites } from "@/hooks/use-favorites";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

const FavoritesSlider = () => {
  const { favorites } = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-10 mt-8">
      <div className="tekno-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="text-red-500" size={22} />
            Your Favorites
          </h2>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: favorites.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent>
            {favorites.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious variant="outline" size="sm" className="relative left-0 right-auto" />
            <CarouselNext variant="outline" size="sm" className="relative right-0 left-auto" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default FavoritesSlider;
