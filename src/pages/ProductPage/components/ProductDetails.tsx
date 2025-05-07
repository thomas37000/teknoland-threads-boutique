
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";

interface ProductDetailsProps {
  product: Product;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleAddToCart: () => void;
}

const ProductDetails = ({
  product,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  quantity,
  setQuantity,
  handleAddToCart
}: ProductDetailsProps) => {
  return (
    <>
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
    </>
  );
};

export default ProductDetails;
