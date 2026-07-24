
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";

const CartTab = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    reservedItems,
    removeReservedItem,
  } = useCart();

  const reservedTotal = reservedItems.reduce(
    (t, i) => t + i.price * i.quantity,
    0,
  );

  if (cartItems.length === 0 && reservedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon Panier</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Votre panier est vide</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mon Panier ({cartItems.length} articles)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 p-4 border rounded-lg">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              {item.size && <p className="text-sm text-gray-500">Taille: {item.size}</p>}
              {item.color && <p className="text-sm text-gray-500">Couleur: {item.color}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total: ${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {reservedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Panier sauvegardé ({reservedItems.length} articles)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reservedItems.map((item) => (
              <div
                key={`reserved-${item.id}-${item.size}-${item.color}`}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.size && (
                    <p className="text-sm text-gray-500">Taille: {item.size}</p>
                  )}
                  {item.color && (
                    <p className="text-sm text-gray-500">Couleur: {item.color}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-600">
                      Quantité : {item.quantity}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeReservedItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <span className="ml-2 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Réservé
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">
                Total réservé : ${reservedTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CartTab;
