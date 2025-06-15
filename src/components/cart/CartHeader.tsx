
import { useTranslation } from "react-i18next";

const CartHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
      <div className="col-span-6">
        <h3 className="font-medium">{t("cart.itemName")}</h3>
      </div>
      <div className="col-span-2 text-center">
        <h3 className="font-medium">{t("cart.priceTTC")}</h3>
      </div>
      <div className="col-span-2 text-center">
        <h3 className="font-medium">{t("cart.quantity")}</h3>
      </div>
      <div className="col-span-2 text-right">
        <h3 className="font-medium">{t("cart.total")}</h3>
      </div>
    </div>
  );
};

export default CartHeader;
