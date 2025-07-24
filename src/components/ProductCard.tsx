
import { Link } from "react-router-dom";
import { Heart, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { Product } from "@/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerName, setSellerName] = useState<string>('');

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (product.seller_id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', product.seller_id)
          .maybeSingle();
        
        if (data) {
          setSellerName(data.full_name || data.email || 'Vendeur');
        }
      } else {
        setSellerName('Teknoland');
      }
    };

    fetchSellerInfo();
  }, [product.seller_id]);
  
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
              {t('common.new')}
            </div>
          )}
        </div>
      </Link>
      
      <div className="mt-4">
        <div className="flex justify-between items-start">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-lg">{product.name}</h3>
          </Link>
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              size={18} 
              className={isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        </div>
        <div className="mt-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            <User size={12} className="mr-1" />
            {sellerName}
          </Badge>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-bold">{product.price.toFixed(2)} €</p>
        </div>
        <Button 
          className="w-full mt-3 bg-tekno-black text-white hover:bg-tekno-blue transition-colors"
          onClick={() => addToCart(product)}
        >
          {t('common.addToCart')}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
