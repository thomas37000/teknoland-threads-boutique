
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

type Category = Tables<"categories">;

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded"></div>;
  }

  const allCategories = [
    { key: "all", label: t('shop.allProducts') },
    ...categories.map(cat => ({ key: cat.slug, label: cat.name }))
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{t('shop.filterByCategory')}</h3>
      <div className="max-lg:flex max-lg:flex-wrap max-lg:gap-2 gap-2 mt-2 mb-4">
        {allCategories.map((category) => (
          <button
            key={category.key}
            className={`flex items-center gap-2 px-4 py-2 mt-1 text-sm rounded-full border ${
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
