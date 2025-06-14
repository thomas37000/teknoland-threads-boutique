
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import ShopHeader from "@/components/shop/ShopHeader";
import CategoryFilter from "@/components/shop/CategoryFilter";
import SortSelect from "@/components/shop/SortSelect";
import ProductsGrid from "@/components/shop/ProductsGrid";
import BackToTop from "@/components/shop/BackToTop";

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [pageSize, setPageSize] = useState(8);
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
      <ShopHeader 
        title="Shop | Teknoland Clothes"
        description="Tous les vêtements et vinyles du label Teknoland Production"
      />
      
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <SortSelect 
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </div>
      
      {/* Products Grid */}
      <ProductsGrid 
        displayedProducts={displayedProducts}
        hasMoreProducts={hasMoreProducts}
        onLoadMore={handleLoadMore}
      />
      
      {/* Back to Top Button */}
      <BackToTop 
        show={showBackToTop}
        onClick={scrollToTop}
      />
    </div>
  );
};

export default ShopPage;
