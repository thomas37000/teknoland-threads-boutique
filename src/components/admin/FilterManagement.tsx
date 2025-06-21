
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

interface ShopFilter {
  id: string;
  name: string;
  type: "category" | "price" | "size" | "color" | "stock" | "brand";
  is_active: boolean;
  display_order: number;
  options?: string[];
  created_at: string;
}

const FilterManagement = () => {
  const [filters, setFilters] = useState<ShopFilter[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ShopFilter | null>(null);
  const [newFilter, setNewFilter] = useState({
    name: "",
    type: "category" as const,
    is_active: true,
    display_order: 0,
    options: ""
  });

  useEffect(() => {
    // Filtres par défaut basés sur l'interface actuelle
    const defaultFilters: ShopFilter[] = [
      {
        id: "1",
        name: "Catégorie",
        type: "category",
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        name: "Prix",
        type: "price",
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        name: "Taille",
        type: "size",
        is_active: true,
        display_order: 3,
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        created_at: new Date().toISOString()
      },
      {
        id: "4",
        name: "Couleur",
        type: "color",
        is_active: true,
        display_order: 4,
        options: ["Noir", "Blanc", "Rouge", "Bleu", "Vert"],
        created_at: new Date().toISOString()
      },
      {
        id: "5",
        name: "Stock",
        type: "stock",
        is_active: true,
        display_order: 5,
        created_at: new Date().toISOString()
      }
    ];
    setFilters(defaultFilters);
  }, []);

  const handleAddFilter = () => {
    if (!newFilter.name) {
      toast({
        title: "Erreur",
        description: "Le nom du filtre est requis",
        variant: "destructive"
      });
      return;
    }

    const filter: ShopFilter = {
      id: Date.now().toString(),
      name: newFilter.name,
      type: newFilter.type,
      is_active: newFilter.is_active,
      display_order: newFilter.display_order || filters.length + 1,
      options: newFilter.options ? newFilter.options.split(",").map(o => o.trim()) : undefined,
      created_at: new Date().toISOString()
    };

    setFilters([...filters, filter]);
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
      description: `${filter.name} a été ajouté avec succès`
    });
  };

  const handleEditFilter = () => {
    if (!currentFilter) return;

    const updatedFilters = filters.map(filter => 
      filter.id === currentFilter.id ? currentFilter : filter
    );
    setFilters(updatedFilters);
    setIsEditDialogOpen(false);
    setCurrentFilter(null);

    toast({
      title: "Filtre modifié",
      description: "Les modifications ont été sauvegardées"
    });
  };

  const toggleFilterStatus = (filterId: string) => {
    const updatedFilters = filters.map(filter => 
      filter.id === filterId ? { ...filter, is_active: !filter.is_active } : filter
    );
    setFilters(updatedFilters);

    const filter = filters.find(f => f.id === filterId);
    toast({
      title: filter?.is_active ? "Filtre désactivé" : "Filtre activé",
      description: `${filter?.name} est maintenant ${filter?.is_active ? 'caché' : 'visible'} sur la boutique`
    });
  };

  const deleteFilter = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    const updatedFilters = filters.filter(f => f.id !== filterId);
    setFilters(updatedFilters);

    toast({
      title: "Filtre supprimé",
      description: `${filter?.name} a été supprimé`
    });
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
                <Select value={newFilter.type} onValueChange={(value) => setNewFilter({...newFilter, type: value as any})}>
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
                    {filter.options ? filter.options.slice(0, 3).join(", ") + (filter.options.length > 3 ? "..." : "") : "Auto"}
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
                                    options: e.target.value ? e.target.value.split(",").map(o => o.trim()) : undefined
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
