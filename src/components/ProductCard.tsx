
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  return (
    <div className="group">
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-md">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {product.isNew && (
            <div className="absolute top-2 right-2 bg-tekno-blue text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
              New
            </div>
          )}
        </div>
      </Link>
      
      <div className="mt-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-lg">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-bold">${product.price.toFixed(2)}</p>
          <p className="text-sm text-tekno-gray">{product.category}</p>
        </div>
        <Button 
          className="w-full mt-3 bg-tekno-black text-white hover:bg-tekno-blue transition-colors"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
