import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  display_order: number;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCategoryData {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  image_url: string;
}

export const EMPTY_CATEGORY: NewCategoryData = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  display_order: 0,
  image_url: "",
};

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        });
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (newCategory: NewCategoryData) => {
    if (!newCategory.name) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive",
      });
      return false;
    }

    try {
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "-"),
        description: newCategory.description || null,
        is_active: newCategory.is_active,
        display_order: newCategory.display_order || categories.length + 1,
        image_url: newCategory.image_url || null,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la catégorie",
          variant: "destructive",
        });
        return false;
      }

      setCategories([...categories, data]);
      toast({
        title: "Catégorie ajoutée",
        description: `${data.name} a été ajoutée avec succès`,
      });
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          is_active: category.is_active,
          display_order: category.display_order,
          image_url: category.image_url || null,
        })
        .eq("id", category.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la catégorie",
          variant: "destructive",
        });
        return false;
      }

      setCategories(categories.map((c) => (c.id === category.id ? data : c)));
      toast({
        title: "Catégorie modifiée",
        description: "Les modifications ont été sauvegardées",
      });
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ is_active: !category.is_active })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) {
        console.error("Error toggling category status:", error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut de la catégorie",
          variant: "destructive",
        });
        return;
      }

      setCategories(categories.map((c) => (c.id === categoryId ? data : c)));
      toast({
        title: data.is_active ? "Catégorie activée" : "Catégorie désactivée",
        description: `${data.name} est maintenant ${data.is_active ? "visible" : "cachée"} sur la boutique`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);

      if (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie",
          variant: "destructive",
        });
        return;
      }

      setCategories(categories.filter((c) => c.id !== categoryId));
      toast({
        title: "Catégorie supprimée",
        description: `${category.name} a été supprimée`,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
  };
};