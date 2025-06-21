
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0
  });

  // Simulation des catégories existantes (en attendant la base de données)
  useEffect(() => {
    // Pour l'instant, on utilise les catégories codées en dur
    const defaultCategories: Category[] = [
      {
        id: "1",
        name: "T-Shirts Hommes",
        slug: "man",
        description: "T-shirts pour hommes",
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "2", 
        name: "T-Shirts Femmes",
        slug: "women",
        description: "T-shirts pour femmes",
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        name: "Sweats",
        slug: "sweats",
        description: "Sweats et hoodies",
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: "4",
        name: "Vinyles",
        slug: "vinyls",
        description: "Collection de vinyles",
        is_active: true,
        display_order: 4,
        created_at: new Date().toISOString()
      }
    ];
    setCategories(defaultCategories);
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
        variant: "destructive"
      });
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      description: newCategory.description,
      is_active: newCategory.is_active,
      display_order: newCategory.display_order || categories.length + 1,
      created_at: new Date().toISOString()
    };

    setCategories([...categories, category]);
    setNewCategory({
      name: "",
      slug: "",
      description: "",
      is_active: true,
      display_order: 0
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Catégorie ajoutée",
      description: `${category.name} a été ajoutée avec succès`
    });
  };

  const handleEditCategory = () => {
    if (!currentCategory) return;

    const updatedCategories = categories.map(cat => 
      cat.id === currentCategory.id ? currentCategory : cat
    );
    setCategories(updatedCategories);
    setIsEditDialogOpen(false);
    setCurrentCategory(null);

    toast({
      title: "Catégorie modifiée",
      description: "Les modifications ont été sauvegardées"
    });
  };

  const toggleCategoryStatus = (categoryId: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, is_active: !cat.is_active } : cat
    );
    setCategories(updatedCategories);

    const category = categories.find(c => c.id === categoryId);
    toast({
      title: category?.is_active ? "Catégorie désactivée" : "Catégorie activée",
      description: `${category?.name} est maintenant ${category?.is_active ? 'cachée' : 'visible'} sur la boutique`
    });
  };

  const deleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);

    toast({
      title: "Catégorie supprimée",
      description: `${category?.name} a été supprimée`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Catégories</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Ex: T-Shirts Premium"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                  placeholder="Ex: t-shirts-premium"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Description de la catégorie"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newCategory.is_active}
                  onCheckedChange={(checked) => setNewCategory({...newCategory, is_active: checked})}
                />
                <Label htmlFor="is_active">Catégorie active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} className="flex-1">Ajouter</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catégories existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={category.is_active ? "text-green-600" : "text-gray-400"}>
                        {category.is_active ? "Visible" : "Cachée"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryStatus(category.id)}
                      >
                        {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier la catégorie</DialogTitle>
                          </DialogHeader>
                          {currentCategory && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Nom de la catégorie</Label>
                                <Input
                                  id="edit-name"
                                  value={currentCategory.name}
                                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-slug">Slug (URL)</Label>
                                <Input
                                  id="edit-slug"
                                  value={currentCategory.slug}
                                  onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                  id="edit-description"
                                  value={currentCategory.description || ""}
                                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleEditCategory} className="flex-1">Sauvegarder</Button>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Annuler</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
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

export default CategoryManagement;
