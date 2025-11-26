
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface CategoryFilterProps {
  selectedCategory: string;
  // onCategoryChange: (category: string) => void;
}

type Category = Tables<"categories">;

const CategoryFilter = ({ selectedCategory }: CategoryFilterProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const handleCategoryClick = (categoryKey: string) => {
    if (categoryKey === "all") {
      navigate('/shop');
    } else {
      navigate(`/shop/${categoryKey}`);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">{t('shop.filterByCategory')}</h3>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => (
          <button
            key={category.key}
            className={`flex items-center gap-2 px-4 py-2 mt-1 text-sm rounded-full border ${
              selectedCategory === category.key
                ? "bg-tekno-black text-white border-tekno-black"
                : "border-gray-300 hover:border-tekno-black"
            }`}
            onClick={() => handleCategoryClick(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
