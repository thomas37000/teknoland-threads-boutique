import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, MapPin, Mail } from "lucide-react";
import ProductsGrid from "@/components/shop/ProductsGrid";
import BackToTop from "@/components/shop/BackToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface VendorInfo {
  id: string;
  brand_name: string | null;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  address: string | null;
}

const VendorStorePage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [pageSize, setPageSize] = useState(8);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const topRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  async function fetchVendorData() {
    try {
      setLoading(true);
      
      // Fetch vendor info
      const { data: vendorData, error: vendorError } = await supabase
        .from("profiles")
        .select("id, brand_name, full_name, email, avatar_url, address")
        .eq("id", vendorId)
        .maybeSingle();

      if (vendorError) {
        setError("Erreur lors du chargement des informations du vendeur");
        return;
      }

      if (!vendorData) {
        setError("Vendeur non trouvé");
        return;
      }

      setVendorInfo(vendorData);

      // Fetch vendor's products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", vendorId)
        .order("created_at", { ascending: false });

      if (productsError) {
        setError("Erreur lors du chargement des produits");
        return;
      }

      setProducts(productsData as Product[] || []);
      setDisplayedProducts((productsData as Product[] || []).slice(0, pageSize));
      
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  }

  const handleLoadMore = () => {
    const currentSize = displayedProducts.length;
    const newProducts = products.slice(currentSize, currentSize + pageSize);
    setDisplayedProducts([...displayedProducts, ...newProducts]);
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasMoreProducts = displayedProducts.length < products.length;
  const vendorName = vendorInfo?.brand_name || vendorInfo?.full_name || "Vendeur";

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/shop">Retour à la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" ref={topRef}>
      <Helmet>
        <title>{vendorName} - Boutique | Teknoland</title>
        <meta name="description" content={`Découvrez tous les produits de ${vendorName} sur Teknoland. Mode, qualité et innovation.`} />
        <link rel="canonical" href={`https://teknoland.lovable.app/vendor/${vendorId}`} />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          asChild 
          className="mb-6 hover:bg-muted"
        >
          <Link to="/shop" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Retour à la boutique
          </Link>
        </Button>

        {/* Vendor Header */}
        {vendorInfo && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={vendorInfo.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    <User size={24} />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{vendorName}</h1>
                  <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      {vendorInfo.email}
                    </div>
                    {vendorInfo.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {vendorInfo.address}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Produits de {vendorName}
          </h2>
        </div>

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
  );
};

export default VendorStorePage;