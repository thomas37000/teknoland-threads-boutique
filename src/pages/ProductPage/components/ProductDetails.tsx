
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { Product } from "@/types";
import { toast } from "sonner";
import { createCheckoutSession } from "@/utils/stripe";

interface ProductDetailsProps {
  product: Product;
  onColorChange?: (color: string) => void;
}

const ProductDetails = ({ product, onColorChange }: ProductDetailsProps) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const toggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(product);
      toast.success("Added to favorites");
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsProcessing(true);
      const { url } = await createCheckoutSession(
        product, 
        quantity, 
        selectedSize, 
        selectedColor
      );
      
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="mt-3 flex items-center">
          <span className="text-2xl font-bold">{product.price.toFixed(2)} €</span>
          {product.isNew && (
            <span className="ml-3 rounded-full bg-tekno-blue px-3 py-1 text-xs text-white">
              NEW
            </span>
          )}
        </div>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <p>{product.description}</p>
      </div>
      
      {/* Stock */}
      <div className="text-sm text-tekno-gray">
        {product.stock > 0 ? (
          <span>In Stock ({product.stock} available)</span>
        ) : (
          <span className="text-red-500">Out of Stock</span>
        )}
      </div>
      
      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Size</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-10 w-10 rounded-md border text-center leading-10 ${
                  selectedSize === size
                    ? "border-tekno-blue bg-tekno-blue/10"
                    : "border-gray-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`h-10 w-10 rounded-full border-2 ${
                  selectedColor === color ? "border-tekno-blue ring-2 ring-tekno-blue/30" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Quantity */}
      <div>
        <h3 className="font-medium mb-2">Quantity</h3>
        <div className="flex items-center border rounded-md w-32">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 text-lg border-r"
            disabled={quantity <= 1}
          >
            -
          </button>
          <div className="px-3 py-1 flex-1 text-center">{quantity}</div>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 text-lg border-l"
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button 
          onClick={handleAddToCart} 
          className="flex-1 gap-2 bg-tekno-blue text-white hover:bg-tekno-blue/90"
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          onClick={toggleFavorite}
          variant="outline"
          className={`gap-2 ${isFavorite(product.id) ? "border-tekno-blue text-tekno-blue" : ""}`}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite(product.id) ? "fill-tekno-blue" : ""}`}
          />
          {isFavorite(product.id) ? "Saved" : "Save"}
        </Button>
      </div>

      {/* Stripe Payment Button */}
      <div className="pt-4">
        <Button 
          onClick={handleBuyNow}
          className="w-full gap-2 bg-black text-white hover:bg-black/80"
          disabled={isProcessing || product.stock <= 0}
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Buy Now with Stripe
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
