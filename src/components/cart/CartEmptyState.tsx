
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const CartEmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="tekno-container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{t("cart.title")}</h1>
      <p className="mb-6">{t("cart.empty")}</p>
      <Link to="/shop">
        <Button className="bg-tekno-blue text-white hover:bg-tekno-blue/90">
          {t("cart.keepShopping")}
        </Button>
      </Link>
    </div>
  );
};

export default CartEmptyState;
