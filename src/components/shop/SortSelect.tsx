
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortSelectProps {
  sortOption: string;
  onSortChange: (value: string) => void;
}

const SortSelect = ({ sortOption, onSortChange }: SortSelectProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full sm:w-auto">
      <h3 className="text-sm font-medium mb-2">{t('shop.sortBy')}</h3>
      <Select value={sortOption} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t('shop.sortBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('shop.newest')}</SelectItem>
          <SelectItem value="price-low">{t('shop.priceLow')}</SelectItem>
          <SelectItem value="price-high">{t('shop.priceHigh')}</SelectItem>
          <SelectItem value="seller">{t('shop.seller')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;
