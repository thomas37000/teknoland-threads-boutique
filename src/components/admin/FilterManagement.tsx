
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type ShopFilter = Tables<"shop_filters">;

const FilterManagement = () => {
  const [filters, setFilters] = useState<ShopFilter[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ShopFilter | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFilter, setNewFilter] = useState({
    name: "",
    type: "category" as const,
    is_active: true,
    display_order: 0,
    options: ""
  });

  // Fetch filters from Supabase
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

  const handleAddFilter = async () => {
    if (!newFilter.name) {
      toast({
        title: "Erreur",
        description: "Le nom du filtre est requis",
        variant: "destructive"
      });
      return;
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
        return;
      }

      setFilters([...filters, data]);
      setNewFilter({
        name: "",
        type: "category",
        is_active: true,
        display_order: 0,
        options: ""
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Filtre ajouté",
        description: `${data.name} a été ajouté avec succès`
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditFilter = async () => {
    if (!currentFilter) return;

    try {
      const { data, error } = await supabase
        .from('shop_filters')
        .update({
          name: currentFilter.name,
          type: currentFilter.type,
          is_active: currentFilter.is_active,
          display_order: currentFilter.display_order,
          options: currentFilter.options
        })
        .eq('id', currentFilter.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating filter:', error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le filtre",
          variant: "destructive"
        });
        return;
      }

      const updatedFilters = filters.map(filter => 
        filter.id === currentFilter.id ? data : filter
      );
      setFilters(updatedFilters);
      setIsEditDialogOpen(false);
      setCurrentFilter(null);

      toast({
        title: "Filtre modifié",
        description: "Les modifications ont été sauvegardées"
      });
    } catch (error) {
      console.error('Error:', error);
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

  const getFilterTypeLabel = (type: string) => {
    const labels = {
      category: "Catégorie",
      price: "Prix",
      size: "Taille",
      color: "Couleur",
      stock: "Stock",
      brand: "Marque"
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tekno-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Filtres</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un filtre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau filtre</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Nom du filtre</Label>
                <Input
                  id="filter-name"
                  value={newFilter.name}
                  onChange={(e) => setNewFilter({...newFilter, name: e.target.value})}
                  placeholder="Ex: Marque"
                />
              </div>
              <div>
                <Label htmlFor="filter-type">Type de filtre</Label>
                <Select value={newFilter.type} onValueChange={(value: any) => setNewFilter({...newFilter, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Catégorie</SelectItem>
                    <SelectItem value="price">Prix</SelectItem>
                    <SelectItem value="size">Taille</SelectItem>
                    <SelectItem value="color">Couleur</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="brand">Marque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-options">Options (séparées par des virgules)</Label>
                <Input
                  id="filter-options"
                  value={newFilter.options}
                  onChange={(e) => setNewFilter({...newFilter, options: e.target.value})}
                  placeholder="Ex: Nike, Adidas, Puma"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter-active"
                  checked={newFilter.is_active}
                  onCheckedChange={(checked) => setNewFilter({...newFilter, is_active: checked})}
                />
                <Label htmlFor="filter-active">Filtre actif</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddFilter} className="flex-1">Ajouter</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres configurés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filters.map((filter) => (
                <TableRow key={filter.id}>
                  <TableCell className="font-medium">{filter.name}</TableCell>
                  <TableCell>{getFilterTypeLabel(filter.type)}</TableCell>
                  <TableCell>
                    {filter.options && filter.options.length > 0 
                      ? filter.options.slice(0, 3).join(", ") + (filter.options.length > 3 ? "..." : "") 
                      : "Auto"
                    }
                  </TableCell>
                  <TableCell>
                    <span className={filter.is_active ? "text-green-600" : "text-gray-400"}>
                      {filter.is_active ? "Actif" : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell>{filter.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFilterStatus(filter.id)}
                      >
                        <Switch checked={filter.is_active} />
                      </Button>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentFilter(filter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le filtre</DialogTitle>
                          </DialogHeader>
                          {currentFilter && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-filter-name">Nom du filtre</Label>
                                <Input
                                  id="edit-filter-name"
                                  value={currentFilter.name}
                                  onChange={(e) => setCurrentFilter({...currentFilter, name: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-filter-options">Options (séparées par des virgules)</Label>
                                <Input
                                  id="edit-filter-options"
                                  value={currentFilter.options?.join(", ") || ""}
                                  onChange={(e) => setCurrentFilter({
                                    ...currentFilter, 
                                    options: e.target.value ? e.target.value.split(",").map(o => o.trim()) : null
                                  })}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleEditFilter} className="flex-1">Sauvegarder</Button>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Annuler</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFilter(filter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterManagement;
