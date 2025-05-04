
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/hooks/use-cart";
// import { products } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Product } from "@/types";
import { ArrowUp } from "lucide-react";

const ProductPage = () => {
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
   const [isLoading, setIsLoading] = useState(true);

   // Fetch product detail from Supabase
   useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match the Product interface
          const transformedData: Product[] = data.map(item => ({
            ...item,
            size_stocks: item.size_stocks ? (item.size_stocks as any) : {}
          }));
          
          setProduct(transformedData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // In a real app, you might fetch this from an API
    const fetchedProduct = products.find(p => p.id === id);

    // const { data } = supabase
    //   .from('products')
    //   .select("*")
    //   .eq('id', id)
    //   .single();

    if (fetchedProduct) {
      setProduct(fetchedProduct);
      setCurrentImage(fetchedProduct.image);

      if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
        setSelectedSize(fetchedProduct.sizes[0]);
      }

      if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
        setSelectedColor(fetchedProduct.colors[0]);
        // Set initial image based on the first color if color images exist
        if (fetchedProduct.colorImages && fetchedProduct.colorImages[fetchedProduct.colors[0]]) {
          setCurrentImage(fetchedProduct.colorImages[fetchedProduct.colors[0]]);
        }
      }
    }
    setLoading(false);
  }, [id]);

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

  return (
    <div className="tekno-container py-12" ref={topRef}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <Link to="/shop" className="text-tekno-blue hover:underline mb-4 inline-block">
            ← Back to Shop
          </Link>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
            <span className="text-tekno-gray">{product.category}</span>
            {product.isNew && (
              <span className="bg-tekno-blue text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
                New
              </span>
            )}
          </div>

          <p className="text-tekno-gray mb-6">{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Size</h3>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex flex-wrap gap-2"
              >
                {product.sizes.map((size) => (
                  <div key={size} className="flex items-center">
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-tekno-black peer-data-[state=checked]:text-white peer-data-[state=checked]:border-tekno-black hover:border-tekno-black"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Color</h3>
              <RadioGroup
                value={selectedColor}
                onValueChange={setSelectedColor}
                className="flex flex-wrap gap-2"
              >
                {product.colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <RadioGroupItem
                      value={color}
                      id={`color-${color}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-tekno-black peer-data-[state=checked]:text-white peer-data-[state=checked]:border-tekno-black hover:border-tekno-black"
                    >
                      {color}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border rounded-md w-32">
              <button
                className="px-3 py-2 border-r"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <div className="px-4 py-2 flex-1 text-center">{quantity}</div>
              <button
                className="px-3 py-2 border-l"
                onClick={() => setQuantity(prev => prev + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <Button
              className="bg-tekno-blue hover:bg-tekno-blue/90 flex-grow text-white"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="font-medium mb-1">Shipping</h3>
              <p className="text-tekno-gray text-sm">
                Free shipping on all orders over $50. Standard delivery 3-5 business days.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Returns</h3>
              <p className="text-tekno-gray text-sm">
                Easy returns within 30 days. See our <Link to="/returns" className="text-tekno-blue hover:underline">return policy</Link> for more details.
              </p>
            </div>
          </div>
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

export default ProductPage;
