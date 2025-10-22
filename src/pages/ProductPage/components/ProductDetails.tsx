
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, CreditCard, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { Product } from "@/types";
import { toast } from "sonner";
import { createCheckoutSession } from "@/utils/stripe";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getColorCode } from "@/utils/color-mapping";

interface ProductDetailsProps {
  product: Product;
  selectedSize?: string;
  setSelectedSize?: (size: string) => void;
  selectedColor?: string;
  setSelectedColor?: (color: string) => void;
  quantity?: number;
  setQuantity?: (quantity: number) => void;
  handleAddToCart?: () => void;
  onColorChange?: (color: string) => void;
}

const ProductDetails = ({ 
  product, 
  selectedSize, 
  setSelectedSize, 
  selectedColor, 
  setSelectedColor, 
  quantity = 1, 
  setQuantity,
  handleAddToCart: externalHandleAddToCart,
  onColorChange 
}: ProductDetailsProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [localSelectedSize, setLocalSelectedSize] = useState<string | undefined>(
    selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined)
  );
  const [localSelectedColor, setLocalSelectedColor] = useState<string | undefined>(
    selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined)
  );
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sellerName, setSellerName] = useState<string>('');

  // Fetch seller info
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (product.seller_id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, brand_name')
          .eq('id', product.seller_id)
          .maybeSingle();
        
        if (data) {
          setSellerName(data.brand_name || data.full_name || data.email || 'Vendeur');
        }
      } else {
        setSellerName('Teknoland');
      }
    };

    fetchSellerInfo();
  }, [product.seller_id]);

  // Use either internal or external state management based on props
  const handleSizeChange = (size: string) => {
    if (setSelectedSize) {
      setSelectedSize(size);
    } else {
      setLocalSelectedSize(size);
    }
  };

  const handleColorChange = (color: string) => {
    if (setSelectedColor) {
      setSelectedColor(color);
    } else {
      setLocalSelectedColor(color);
    }
    
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, product.stock));
    
    if (setQuantity) {
      setQuantity(validQuantity);
    } else {
      setLocalQuantity(validQuantity);
    }
  };

  const internalHandleAddToCart = () => {
    const currentSize = selectedSize || localSelectedSize;
    const currentColor = selectedColor || localSelectedColor;
    const currentQuantity = quantity || localQuantity;
    
    // Validate selections if needed
    if (product.sizes && product.sizes.length > 0 && !currentSize) {
      toast.error(t('product.pleaseSelectSize'));
      return;
    }

    if (product.colors && product.colors.length > 0 && !currentColor) {
      toast.error(t('product.pleaseSelectColor'));
      return;
    }
    
    addToCart(product, currentQuantity, currentSize, currentColor);
    toast.success(`${product.name} ${t('product.productAddedToCart')}`);
  };

  const toggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success(t('product.removeFromFavorites'));
    } else {
      addToFavorites(product);
      toast.success(t('product.addToFavorites'));
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsProcessing(true);
      const { url } = await createCheckoutSession(
        product, 
        quantity || localQuantity, 
        selectedSize || localSelectedSize, 
        selectedColor || localSelectedColor
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

  // Function to get stock for selected size and color
  const getStockForSizeAndColor = (size: string | undefined, color: string | undefined) => {
    if (!size && !color) return product.stock;
    
    let stock = 0;
    
    // Vérifier d'abord product.variations
    let variations = product.variations;
    
    // Si pas de variations au niveau product, chercher dans size_stocks.variations
    if ((!variations || variations.length === 0) && product.size_stocks) {
      const sizeStocksData = product.size_stocks as any;
      if (sizeStocksData.variations && Array.isArray(sizeStocksData.variations)) {
        variations = sizeStocksData.variations;
      }
    }
    
    if (variations && variations.length > 0) {
      // Format avec variations - filtrer par taille ET couleur
      let filteredVariations = variations;
      
      // Filtrer par taille ET couleur simultanément si les deux sont sélectionnés
      if (size && color) {
        filteredVariations = filteredVariations.filter(
          variation => variation.size === size && variation.color === color
        );
      } else if (size) {
        // Seulement par taille
        filteredVariations = filteredVariations.filter(variation => variation.size === size);
      } else if (color) {
        // Seulement par couleur
        filteredVariations = filteredVariations.filter(variation => variation.color === color);
      }
      
      stock = filteredVariations.reduce((total, variation) => total + (variation.stock || 0), 0);
    } else if (product.size_stocks && size) {
      // Ancien format avec size_stocks (ne gère que les tailles uniquement, pas les couleurs)
      const stockData = (product.size_stocks as any).sizeStocks || product.size_stocks;
      stock = stockData[size] || 0;
    } else {
      stock = product.stock;
    }
    
    return stock;
  };

  // Function to get color display name in French
  const getColorName = (color: string) => {
    const colorNames: { [key: string]: { fr: string; en: string } } = {
      '#000000': { fr: 'Noir', en: 'Black' },
      '#ffffff': { fr: 'Blanc', en: 'White' },
      '#ff0000': { fr: 'Rouge', en: 'Red' },
      '#00ff00': { fr: 'Vert', en: 'Green' },
      '#0000ff': { fr: 'Bleu', en: 'Blue' },
      '#ffff00': { fr: 'Jaune', en: 'Yellow' },
      '#ff69b4': { fr: 'Rose', en: 'Pink' },
      '#800080': { fr: 'Violet', en: 'Purple' },
      '#ffa500': { fr: 'Orange', en: 'Orange' },
      '#a52a2a': { fr: 'Marron', en: 'Brown' },
      '#808080': { fr: 'Gris', en: 'Gray' },
      'black': { fr: 'Noir', en: 'Black' },
      'white': { fr: 'Blanc', en: 'White' },
      'red': { fr: 'Rouge', en: 'Red' },
      'green': { fr: 'Vert', en: 'Green' },
      'blue': { fr: 'Bleu', en: 'Blue' },
      'yellow': { fr: 'Jaune', en: 'Yellow' },
      'pink': { fr: 'Rose', en: 'Pink' },
      'purple': { fr: 'Violet', en: 'Purple' },
      'orange': { fr: 'Orange', en: 'Orange' },
      'brown': { fr: 'Marron', en: 'Brown' },
      'gray': { fr: 'Gris', en: 'Gray' },
      'grey': { fr: 'Gris', en: 'Gray' }
    };

    const colorInfo = colorNames[color.toLowerCase()];
    if (colorInfo) {
      return t('common.language') === 'fr' ? colorInfo.fr : colorInfo.en;
    }
    return color;
  };

  // Use either the provided sizes or get from product
  const currentSize = selectedSize || localSelectedSize;
  const currentColor = selectedColor || localSelectedColor;
  const currentQuantity = quantity || localQuantity;

  return (
    <div className="space-y-6">
      {/* Product not available message */}
      {product.stock <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">404 NOT FOUND</h2>
          <p className="text-red-700">Ce produit n'est plus disponible</p>
        </div>
      )}
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="mt-3 flex items-center flex-wrap gap-3">
          <span className="text-2xl font-bold">{product.price.toFixed(2)} €</span>
          {product.isNew && (
            <span className="rounded-full bg-tekno-blue px-3 py-1 text-xs text-white">
              {t('product.newProduct')}
            </span>
          )}
          {/* Seller badge */}
          <Link 
            to={product.seller_id ? `/vendor/${product.seller_id}` : '#'}
            className={product.seller_id ? "hover:opacity-80 transition-opacity" : "cursor-default"}
            onClick={(e) => !product.seller_id && e.preventDefault()}
          >
            <Badge variant="secondary" className="text-xs">
              <User size={12} className="mr-1" />
              {sellerName}
            </Badge>
          </Link>
        </div>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <p>{product.description}</p>
      </div>

      {/* Vinyl Tracks Section */}
      {(product.category === "Vinyles" || product.category === "Double Vinyles") && product.size_stocks && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            🎵 Liste des titres
          </h3>
          
          {/* Streaming Link */}
          {(() => {
            const sizeStocks = product.size_stocks as any;
            const streamingUrl = sizeStocks?.streamingUrl;
            
            if (streamingUrl) {
              return (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">🎧 Écouter en ligne:</span>
                  </div>
                  <a 
                    href={streamingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    🎵 Écouter sur la plateforme
                  </a>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Track List */}
          {(() => {
            const sizeStocks = product.size_stocks as any;
            const vinylTracks = sizeStocks?.vinylTracks || [];
            
            if (vinylTracks.length > 0) {
              return (
                <div className="space-y-2">
                  {vinylTracks.map((track: any, index: number) => (
                    <div key={track.id || index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <div className="flex-1">
                        <span className="font-medium">{track.name}</span>
                        {track.artist && (
                          <span className="text-gray-600 ml-2">- {track.artist}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {track.duration && (
                          <span>{track.duration}</span>
                        )}
                        {track.year && (
                          <span>({track.year})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            } else {
              return (
                <p className="text-gray-500 italic">Aucun titre disponible</p>
              );
            }
          })()}
        </div>
      )}
      
      {/* Stock */}
      <div className="text-sm text-tekno-gray">
        {product.stock > 0 ? (
          <div className="space-y-1">
            <span>{t('product.inStock')} ({product.stock} {t('product.available')} au total)</span>
            {(currentSize || currentColor) && (
              <div className="text-tekno-blue font-medium">
                {currentSize && currentColor && `Taille ${currentSize}, couleur ${getColorName(currentColor)}: `}
                {currentSize && !currentColor && `Taille ${currentSize}: `}
                {!currentSize && currentColor && `Couleur ${getColorName(currentColor)}: `}
                {getStockForSizeAndColor(currentSize, currentColor)} en stock
              </div>
            )}
          </div>
        ) : (
          <span className="text-red-500">{t('product.outOfStock')}</span>
        )}
      </div>
      
      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">{t('product.size')}</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              // Calculer le stock pour cette taille en utilisant les variations et la couleur sélectionnée
              let sizeStock = getStockForSizeAndColor(size, currentColor);
              
              const isAvailable = sizeStock > 0;
              
              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`h-10 w-10 rounded-md border text-center leading-10 transition-colors cursor-pointer ${
                    currentSize === size
                      ? "border-tekno-blue bg-tekno-blue/10 text-tekno-blue"
                      : isAvailable
                        ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        : "border-gray-300 text-gray-400 opacity-50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">{t('product.color')}</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => {
              // Calculer le stock pour cette couleur en utilisant les variations et la taille sélectionnée
              const colorStock = getStockForSizeAndColor(currentSize, color);
              const isAvailable = colorStock > 0;
              
              return (
                <div key={color} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleColorChange(color)}
                    disabled={!isAvailable}
                    className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      currentColor === color 
                        ? "ring-2 ring-offset-2 ring-tekno-blue" 
                        : isAvailable
                          ? "border-gray-300 hover:border-gray-400 cursor-pointer"
                          : "border-gray-300 opacity-50 cursor-not-allowed"
                    }`}
                    style={{ 
                      backgroundColor: getColorCode(color),
                      borderColor: currentColor === color ? getColorCode(color) : '#d1d5db'
                    }}
                    aria-label={`${t('product.selectColor')} ${getColorName(color)}`}
                  />
                  <span className={`text-xs capitalize ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                    {getColorName(color)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Quantity */}
      <div>
        <h3 className="font-medium mb-2">{t('product.quantity')}</h3>
        <div className="flex items-center border rounded-md w-32">
          <button
            onClick={() => handleQuantityChange(currentQuantity - 1)}
            className="px-3 py-1 text-lg border-r hover:bg-gray-50 transition-colors"
            disabled={currentQuantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <div className="px-3 py-1 flex-1 text-center">{currentQuantity}</div>
          <button
            onClick={() => handleQuantityChange(currentQuantity + 1)}
            className="px-3 py-1 text-lg border-l hover:bg-gray-50 transition-colors"
            disabled={currentQuantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button 
          onClick={externalHandleAddToCart || internalHandleAddToCart}
          className="flex-1 gap-2 bg-tekno-blue text-white hover:bg-tekno-blue/90"
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {t('product.addToCart')}
        </Button>
        <Button
          onClick={toggleFavorite}
          variant="outline"
          className={`gap-2 ${isFavorite(product.id) ? "border-tekno-blue text-tekno-blue" : ""}`}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite(product.id) ? "fill-tekno-blue" : ""}`}
          />
          {isFavorite(product.id) ? t('product.saved') : t('product.save')}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
