
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
  isProcessingPayment: boolean;
}

const CartSummary = ({ subtotal, onCheckout, isProcessingPayment }: CartSummaryProps) => {
  return (
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

        <Button 
          className="w-full bg-tekno-blue text-white hover:bg-tekno-blue/90"
          onClick={onCheckout}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? "Traitement..." : "Passer la commande"}
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
