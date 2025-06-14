
import { useTranslation } from "react-i18next";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useTranslation();
  
  const categories = [
    { key: "all", label: t('shop.allProducts') },
    { key: "t-shirts", label: t('shop.tShirts') },
    { key: "man", label: t('shop.menTShirts') },
    { key: "women", label: t('shop.womenTShirts') },
    { key: "sweats", label: t('shop.sweats') },
    { key: "accessories", label: t('shop.accessories') },
    { key: "vinyls", label: t('shop.vinyls') },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{t('shop.filterByCategory')}</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`px-4 py-2 text-sm rounded-full border ${
              selectedCategory === category.key
                ? "bg-tekno-black text-white border-tekno-black"
                : "border-gray-300 hover:border-tekno-black"
            }`}
            onClick={() => onCategoryChange(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
