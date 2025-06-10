
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart after successful payment
    if (sessionId) {
      clearCart();
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [sessionId, clearCart]);

  return (
    <div className="tekno-container py-16 flex flex-col items-center justify-center text-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-tekno-blue border-t-transparent animate-spin" />
          <p className="text-lg">Traitement de votre paiement...</p>
        </div>
      ) : (
        <>
          <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Paiement réussi !</h1>
          <p className="mb-8 text-gray-600 max-w-md">
            Merci pour votre achat. Nous avons envoyé un email de confirmation avec les détails de votre commande.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/shop")}
              variant="outline"
            >
              Continuer les achats
            </Button>
            <Button 
              onClick={() => navigate("/profile")}
              className="bg-tekno-blue text-white hover:bg-tekno-blue/90"
            >
              Voir vos commandes
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
