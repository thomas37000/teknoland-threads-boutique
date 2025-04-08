
import { useEffect, useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useFavorites } from "@/hooks/use-favorites";
import ProductCard from "@/components/ProductCard";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FavoritesSlider = () => {
  const { favorites, loading } = useFavorites();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        console.error("Error checking user:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Don't display if loading or no favorites
  if (loading) {
    return (
      <section className="bg-gray-50 py-10 mt-8">
        <div className="tekno-container text-center">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-tekno-gray" />
          </div>
        </div>
      </section>
    );
  }

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
