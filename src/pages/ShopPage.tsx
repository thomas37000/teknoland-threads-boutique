
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [pageSize, setPageSize] = useState(8); // Number of products to show initially
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const topRef = useRef<HTMLDivElement>(null);
  
  // Get category from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }
  }, [searchParams]);

  useEffect(() => {
    getProducts();
  }, []);

async function getProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error);
    } else {
      setProducts(data as Product[]);
    }
  } catch (error) {
    console.error(error);
    setError(error);
  } finally {
    setLoading(false);
  }
}

  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => 
        p.category.toLowerCase().includes(selectedCategory)
      );
    }
    
    // Apply sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
      result = result.filter(p => p.isNew).concat(result.filter(p => !p.isNew));
    }
    
    setFilteredProducts(result);
    
    // Reset displayed products when filters change
    setDisplayedProducts(result.slice(0, pageSize));
  }, [products, selectedCategory, sortOption, pageSize]);
  
  // Load more products handler
  const handleLoadMore = () => {
    const currentSize = displayedProducts.length;
    const newProducts = filteredProducts.slice(currentSize, currentSize + pageSize);
    setDisplayedProducts([...displayedProducts, ...newProducts]);
  };
  
  // Scroll to top handler
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle scroll event to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const hasMoreProducts = displayedProducts.length < filteredProducts.length;
  
  return (
    <div className="tekno-container py-12" ref={topRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop | Teknoland Clothes</h1>
        <p className="text-tekno-gray">
          Tous les vêtements et vinyles du label Teknoland Production
        </p>
      </div>
      
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "all"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              All Products
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "t-shirts"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("t-shirts")}
            >
              T-Shirts
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "man"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("man")}
            >
              T-shirts Homme
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "women"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("women")}
            >
              T-shirts Femme
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "sweats"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("sweats")}
            >
              Sweats
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "accessories"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("accessories")}
            >
              Accessories
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full border ${
                selectedCategory === "vinyls"
                  ? "bg-tekno-black text-white border-tekno-black"
                  : "border-gray-300 hover:border-tekno-black"
              }`}
              onClick={() => setSelectedCategory("vinyls")}
            >
              Vinyles
            </button>
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <h3 className="text-sm font-medium mb-2">Sort by</h3>
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMoreProducts && (
            <div className="mt-10 text-center">
              <Button 
                onClick={handleLoadMore} 
                className="bg-tekno-black hover:bg-tekno-blue text-white"
              >
                Load More Products
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-tekno-gray">
            Try changing your filters or check back later for new items.
          </p>
        </div>
      )}
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full p-3 bg-tekno-blue hover:bg-tekno-black text-white shadow-lg z-50"
          size="icon"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ShopPage;
