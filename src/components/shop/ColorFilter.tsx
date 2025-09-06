import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getColorCode } from "@/utils/color-mapping";

interface ColorFilterProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorFilter = ({ selectedColor, onColorChange }: ColorFilterProps) => {
  const { t } = useTranslation();
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableColors();
  }, []);

  const fetchAvailableColors = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('colors')
        .not('colors', 'is', null);

      if (error) {
        console.error('Error fetching colors:', error);
        return;
      }

      // Extraire toutes les couleurs uniques
      const allColors = new Set<string>();
      data?.forEach(product => {
        if (product.colors) {
          product.colors.forEach((color: string) => {
            if (color && color.trim()) {
              allColors.add(color.toLowerCase().trim());
            }
          });
        }
      });

      setAvailableColors(Array.from(allColors).sort());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded"></div>;
  }

  if (availableColors.length === 0) {
    return null;
  }

  const colorOptions = [
    { key: "all", label: t('shop.allColors', { defaultValue: 'Toutes les couleurs' }), color: null },
    ...availableColors.map(color => ({ 
      key: color, 
      label: color.charAt(0).toUpperCase() + color.slice(1), 
      color: getColorCode(color) 
    }))
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">{t('shop.filterByColor', { defaultValue: 'Filtrer par couleur' })}</h3>
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((colorOption) => (
          <button
            key={colorOption.key}
            className={`flex items-center gap-2 px-3 py-2 mt-1 text-sm rounded-full border transition-colors ${
              selectedColor === colorOption.key
                ? "bg-tekno-black text-white border-tekno-black"
                : "border-gray-300 hover:border-tekno-black"
            }`}
            onClick={() => onColorChange(colorOption.key)}
          >
            {colorOption.color && (
              <div
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: colorOption.color }}
              />
            )}
            <span>{colorOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;