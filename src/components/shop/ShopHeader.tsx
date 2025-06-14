
import { useTranslation } from "react-i18next";

interface ShopHeaderProps {
  title?: string;
  description?: string;
}

const ShopHeader = ({ title, description }: ShopHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{title || t('shop.title')}</h1>
      <p className="text-tekno-gray">{description || t('shop.description')}</p>
    </div>
  );
};

export default ShopHeader;
