
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { ArrowUp } from "lucide-react";
import ProductImages from "./components/ProductImages";
import ProductDetails from "./components/ProductDetails";

const ProductPageContainer = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");

  const topRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch product detail from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          throw error;
        }

        if (data) {
          // Transform the data to match the Product interface
          const product: Product = {
            ...data,
            isNew: data.is_new,
            size_stocks: data.size_stocks as Record<string, number> | null,
          };

          setProduct(product);
          setCurrentImage(product.image);

          // Set initial size if available
          if (product.sizes && product.sizes.length > 0) {
            setSelectedSize(product.sizes[0]);
          }

          // Set initial color if available
          if (product.colors && product.colors.length > 0) {
            setSelectedColor(product.colors[0]);
            // Set initial image based on the first color if color images exist
            if (product.colorImages && product.colorImages[product.colors[0]]) {
              setCurrentImage(product.colorImages[product.colors[0]]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  // Update image when color changes
  useEffect(() => {
    if (product && selectedColor && product.colorImages && product.colorImages[selectedColor]) {
      setCurrentImage(product.colorImages[selectedColor]);
    }
  }, [selectedColor, product]);

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

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate selections if needed
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  // Function to get all available images
  const getAllImages = (): string[] => {
    if (!product) return [];

    const allImages: string[] = [product.image];

    // Add additional images if available
    if (product.images && product.images.length > 0) {
      allImages.push(...product.images);
    }

    // Add color specific images
    if (product.colorImages) {
      Object.values(product.colorImages).forEach(img => {
        if (!allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }

    // Filter out duplicates and limit to first 4
    return [...new Set(allImages)].slice(0, 4);
  };

  if (loading) {
    return (
      <div className="tekno-container py-16 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="tekno-container py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you are looking for does not exist.</p>
        <Link to="/shop">
          <Button>Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const allImages = getAllImages();

  return (
    <div className="tekno-container py-12" ref={topRef}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image Section */}
        <div className="w-full md:w-1/2">
          <ProductImages 
            currentImage={currentImage} 
            setCurrentImage={setCurrentImage}
            images={allImages}
          />
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <ProductDetails
            product={product}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            quantity={quantity}
            setQuantity={setQuantity}
            handleAddToCart={handleAddToCart}
          />
        </div>
      </div>

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

export default ProductPageContainer;
