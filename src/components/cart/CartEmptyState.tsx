
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CartEmptyState = () => {
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
};

export default CartEmptyState;
