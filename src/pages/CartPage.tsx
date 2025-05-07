
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Trash2 } from 'lucide-react';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal
  } = useCart();

  // When user delete product and cart is === 0
  if (cartItems.length === 0) {
    return (
      <div className="tekno-container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Votre panier</h1>
        <p className="mb-6">Votre panier est pour l'instant vide.</p>
        <Link to="/shop">
          <Button className="bg-tekno-blue text-white hover:bg-tekno-blue/90">
            Continuez le Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="tekno-container py-12">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
              <div className="col-span-6">
                <h3 className="font-medium">Nom de l'article</h3>
              </div>
              <div className="col-span-2 text-center">
                <h3 className="font-medium">Prix TTC</h3>
              </div>
              <div className="col-span-2 text-center">
                <h3 className="font-medium">Quantité</h3>
              </div>
              <div className="col-span-2 text-right">
                <h3 className="font-medium">Total</h3>
              </div>
            </div>

            {cartItems.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="grid sm:grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                {/* Mobile Product View */}
                <div className="sm:hidden flex items-center justify-between mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-tekno-gray hover:text-tekno-black transition-colors"
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>

                {/* Product */}
                <div className="sm:col-span-6 flex items-center gap-4">
                  <div className="hidden sm:block w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <Link to={`/product/${item.product.id}`} className="block overflow-hidden rounded-md">
                      <h4 className="font-medium hover:underline">{item.product.name}</h4>
                    </Link>
                    <div className="text-tekno-gray text-sm mt-1">
                      {item.size && <span className="mr-2">Taille: {item.size}</span>}
                      {item.color && <span>Couleur: {item.color}</span>}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-tekno-blue hover:underline text-sm mt-2 hidden sm:inline-block"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-2 flex items-center sm:justify-center">
                  <div className="sm:hidden font-medium mr-2">Price:</div>
                  <div>{item.product.price.toFixed(2)} €</div>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2 flex items-center sm:justify-center">
                  <div className="sm:hidden font-medium mr-2">Quantity:</div>
                  <div className="flex items-center border rounded-md">
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <div className="px-2 py-1">{item.quantity}</div>
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="sm:col-span-2 flex items-center sm:justify-end">
                  <div className="sm:hidden font-medium mr-2">Total:</div>
                  <div className="font-medium">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link to="/shop">
              <Button variant="outline" className="hover:bg-tekno-black hover:text-white">
                Continuez le Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Récapitulatif de la commande</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Sous total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{subtotal > 50 ? "Offert" : "4.99 €"} </span>
              </div>
              <div className="border-t pt-3 font-bold flex justify-between">
                <span>Total</span>
                <span>{(subtotal > 50 ? subtotal : subtotal + 4.99).toFixed(2)} €</span>
              </div>
            </div>

            <Button className="w-full bg-tekno-blue text-white hover:bg-tekno-blue/90">
              Passer la commande
            </Button>

            {/* Promo Code */}

            {/* <div className="mt-6">
              <h3 className="font-medium mb-2">Have a promo code?</h3>
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  className="px-3 py-2 border rounded-l-md flex-grow"
                />
                <Button className="rounded-l-none" variant="outline">
                  Apply
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
