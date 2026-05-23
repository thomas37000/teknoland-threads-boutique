import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

const PLACEHOLDER = "/placeholder.svg";

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,slug,image_url,is_active,display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setCategories((data as CategoryRow[]) || []);
    })();
  }, []);

  return (
    <section className="py-16 bg-tekno-lightgray">
      <div className="tekno-container">
        <h2 className="text-3xl font-bold text-center mb-8">Shop By Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/shop/${category.slug}`}
              className="group block relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-tekno-black/50 group-hover:bg-tekno-black/30 transition-colors z-10" />
              <img 
                src={category.image_url || PLACEHOLDER}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <span className="inline-block border-b-2 border-tekno-blue pb-1 font-medium text-sm">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
