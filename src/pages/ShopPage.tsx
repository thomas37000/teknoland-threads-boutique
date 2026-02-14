import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import ShopHeader from "@/components/shop/ShopHeader";
import CategoryFilter from "@/components/shop/CategoryFilter";
import ColorFilter from "@/components/shop/ColorFilter";
import SortSelect from "@/components/shop/SortSelect";
import ProductsGrid from "@/components/shop/ProductsGrid";
import BackToTop from "@/components/shop/BackToTop";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { transformProductsFromDB } from "@/utils/product-transform";

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { category: categoryParam } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [pageSize, setPageSize] = useState(8);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellersData, setSellersData] = useState<{ [key: string]: string }>({});

  const topRef = useRef<HTMLDivElement>(null);

  // Get category from URL parameters (either from path or query string)
  useEffect(() => {
    const categoryFromQuery = searchParams.get("category");
    const categoryFromPath = categoryParam;
    
    if (categoryFromPath) {
      setSelectedCategory(categoryFromPath.toLowerCase());
    } else if (categoryFromQuery) {
      setSelectedCategory(categoryFromQuery.toLowerCase());
    }
  }, [searchParams, categoryParam]);

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
        const transformedProducts = transformProductsFromDB(data);
        setProducts(transformedProducts);

        // Get seller information for products that have seller_id
        const sellerIds = [...new Set(data?.map(p => p.seller_id).filter(Boolean))];
        if (sellerIds.length > 0) {
          const { data: sellersData, error: sellersError } = await supabase
            .from("profiles")
            .select("id, brand_name, full_name")
            .in("id", sellerIds);

          if (!sellersError && sellersData) {
            const sellersMap = sellersData.reduce((acc, seller) => {
              acc[seller.id] = seller.brand_name || seller.full_name || 'Vendeur';
              return acc;
            }, {} as { [key: string]: string });
            setSellersData(sellersMap);
          }
        }
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
    if (selectedCategory === "promos") {
      // Filter only products with sold_price (sale products)
      result = result.filter(p => p.sold_price != null);
    } else if (selectedCategory !== "all") {
      result = result.filter(p =>
        p.category.toLowerCase().includes(selectedCategory)
      );
    }

    // Apply color filter
    if (selectedColor !== "all") {
      result = result.filter(p =>
        p.colors && p.colors.some(color =>
          color.toLowerCase().trim() === selectedColor
        )
      );
    }

    // Apply sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === "new-only") {
      result = result.filter(p => p.isNew);
    } else if (sortOption === "seller") {
      result.sort((a, b) => {
        const sellerA = a.seller_id ? sellersData[a.seller_id] || 'Vendeur' : 'Teknoland';
        const sellerB = b.seller_id ? sellersData[b.seller_id] || 'Vendeur' : 'Teknoland';
        return sellerA.localeCompare(sellerB);
      });
    }

    setFilteredProducts(result);

    // Reset displayed products when filters change
    setDisplayedProducts(result.slice(0, pageSize));
  }, [products, selectedCategory, selectedColor, sortOption, pageSize, sellersData]);

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

  const { t } = useTranslation();

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedColor("all");
    setSortOption("newest");
    navigate('/shop');
  };

  // SEO pour la boutique
  const shopTitle = t('shop.seoTitle', { defaultValue: "Teknoland clothes | Shop" });
  const shopDescription = t('shop.seoDescription', { defaultValue: "Découvrez tous nos t-shirts, sweats, accessoires et vinyles. Qualité premium, mode et innovation. Expédition rapide et offerte dès 50€." });
  const shopCanonical = "https://teknoland.lovable.app/shop";
  const shopOgImage = "https://lovable.dev/opengraph-image-p98pqg.png";

  return (
    <div className="tekno-container py-12" ref={topRef}>
      <Helmet>
        <title>{shopTitle}</title>
        <meta name="description" content={shopDescription} />
        <link rel="canonical" href={shopCanonical} />
        <meta property="og:title" content={shopTitle} />
        <meta property="og:description" content={shopDescription} />
        <meta property="og:url" content={shopCanonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={shopOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shopTitle} />
        <meta name="twitter:description" content={shopDescription} />
        <meta name="twitter:image" content={shopOgImage} />
      </Helmet>

      <div className="flex justify-between">
        <div>
          {/* H1 principal de la page */}
          <h1 className="text-3xl font-bold mb-2">{shopTitle}</h1>

          {/* ShopHeader n'affiche pas de H1, donc c'est bon d'en garder un ici */}
          <ShopHeader
            title={t('shop.title')}
            description={t('shop.description')}
          />
        </div>

        {/* Sort hidden on responsive tablet and phone */}
        <div className="max-lg:hidden">
          <SortSelect
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Fixed width */}
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto bg-white lg:border lg:rounded-lg lg:p-4 lg:shadow-sm">
            {/* Reset Filters Button */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-lg font-semibold">{t('shop.filters', { defaultValue: 'Filtres' })}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-sm"
                disabled={selectedCategory === "all" && selectedColor === "all" && sortOption === "newest"}
              >
                {t('shop.resetFilters', { defaultValue: 'Reset' })}
              </Button>
            </div>

            {/* Filters */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              handleResetFilters={handleResetFilters}
            />

            <ColorFilter
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />

            {/* Sort only visible on responsive tablet and phone */}
            <div className="lg:hidden mb-4">
              <SortSelect
                sortOption={sortOption}
                onSortChange={setSortOption}
              />
            </div>
          </div>
        </div>

        {/* Products Section - Fixed width */}
        <div className="flex-1 min-w-0">
          {/* Products Grid */}
          <ProductsGrid
            displayedProducts={displayedProducts}
            hasMoreProducts={hasMoreProducts}
            onLoadMore={handleLoadMore}
            loading={loading}
          />

          {/* Back to Top Button */}
          <BackToTop
            show={showBackToTop}
            onClick={scrollToTop}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
