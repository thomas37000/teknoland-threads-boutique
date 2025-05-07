
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { ArrowLeft, ArrowRight, ArrowUp, ZoomIn, ZoomOut, Image as ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);
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

  const handleImageClick = (image: string) => {
    setCurrentImage(image);
    // Reset zoom when changing image
    setIsZoomed(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.5);
      if (!isZoomed) setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(1, prev - 0.5));
      if (zoomLevel <= 1.5) setIsZoomed(false);
    } else {
      setIsZoomed(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
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
          {/* Main Image with Zoom */}
          <div
            className="rounded-lg overflow-hidden bg-gray-100 relative"
            ref={imageRef}
            onMouseMove={handleMouseMove}
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
            onClick={() => isZoomed ? setIsZoomed(false) : handleZoomIn()}
          >
            <div
              className={`transition-transform duration-200 h-full w-full`}
              style={{
                transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center'
              }}
            >
              <img
                src={currentImage || product.image}
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Gallery Tabs */}
          <div className="mt-4">
            {allImages.length > 1 ? (
              <ScrollArea className="whitespace-nowrap pb-4">
                <div className="flex gap-2">
                  {allImages.map((img, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer transition-all ${currentImage === img ? 'ring-2 ring-tekno-blue' : 'ring-1 ring-gray-200'
                        }`}
                      onClick={() => handleImageClick(img)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <Link to="/shop" className="text-tekno-blue hover:underline mb-4 inline-block">
            ← Back to Shop
          </Link>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <p className="text-2xl font-bold">{product.price.toFixed(2)} €</p>
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
