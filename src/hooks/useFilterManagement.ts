import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ShopFilter = Tables<"shop_filters">;

export interface NewFilterData {
  name: string;
  type: "category" | "price" | "size" | "color" | "stock" | "brand";
  is_active: boolean;
  display_order: number;
  options: string;
}

export const useFilterManagement = () => {
  const [filters, setFilters] = useState<ShopFilter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_filters')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching filters:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les filtres",
          variant: "destructive"
        });
        return;
      }

      setFilters(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const addFilter = async (newFilter: NewFilterData) => {
    if (!newFilter.name) {
      toast({
        title: "Erreur",
        description: "Le nom du filtre est requis",
        variant: "destructive"
      });
      return false;
    }

    try {
      const filterData = {
        name: newFilter.name,
        type: newFilter.type,
        is_active: newFilter.is_active,
        display_order: newFilter.display_order || filters.length + 1,
        options: newFilter.options ? newFilter.options.split(",").map(o => o.trim()) : null,
      };

      const { data, error } = await supabase
        .from('shop_filters')
        .insert([filterData])
        .select()
        .single();

      if (error) {
        console.error('Error adding filter:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le filtre",
          variant: "destructive"
        });
        return false;
      }

      setFilters([...filters, data]);
      toast({
        title: "Filtre ajouté",
        description: `${data.name} a été ajouté avec succès`
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const updateFilter = async (filter: ShopFilter) => {
    try {
      const { data, error } = await supabase
        .from('shop_filters')
        .update({
          name: filter.name,
          type: filter.type,
          is_active: filter.is_active,
          display_order: filter.display_order,
          options: filter.options
        })
        .eq('id', filter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating filter:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le filtre",
          variant: "destructive"
        });
        return false;
      }

      const updatedFilters = filters.map(f => 
        f.id === filter.id ? data : f
      );
      setFilters(updatedFilters);
      toast({
        title: "Filtre modifié",
        description: "Les modifications ont été sauvegardées"
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const toggleFilterStatus = async (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    try {
      const { data, error } = await supabase
        .from('shop_filters')
        .update({ is_active: !filter.is_active })
        .eq('id', filterId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling filter status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut du filtre",
          variant: "destructive"
        });
        return;
      }

      const updatedFilters = filters.map(f => 
        f.id === filterId ? data : f
      );
      setFilters(updatedFilters);

      toast({
        title: data.is_active ? "Filtre activé" : "Filtre désactivé",
        description: `${data.name} est maintenant ${data.is_active ? 'visible' : 'caché'} sur la boutique`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteFilter = async (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    try {
      const { error } = await supabase
        .from('shop_filters')
        .delete()
        .eq('id', filterId);

      if (error) {
        console.error('Error deleting filter:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le filtre",
          variant: "destructive"
        });
        return;
      }

      const updatedFilters = filters.filter(f => f.id !== filterId);
      setFilters(updatedFilters);

      toast({
        title: "Filtre supprimé",
        description: `${filter.name} a été supprimé`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    filters,
    loading,
    addFilter,
    updateFilter,
    toggleFilterStatus,
    deleteFilter
  };
};
